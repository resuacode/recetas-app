// frontend/src/components/RecipeList.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RecipeCard from './RecipeCard';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const RecipeList = () => {
  const [allRecipes, setAllRecipes] = useState([]); // Almacena todas las recetas del backend
  const [displayedRecipes, setDisplayedRecipes] = useState([]); // Las recetas que se muestran en la página actual (después de filtros, orden y paginación)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para filtros y ordenación
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriesInput, setCategoriesInput] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [authorFilter, setAuthorFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('createdAt:desc');

  // Estados para el dropdown de categorías
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedDropdownIndex, setSelectedDropdownIndex] = useState(-1);

  // Ref para el timeout del debouncing (no se usará para el filtrado local, pero lo dejamos)
  const debounceTimeoutRef = useRef(null);
  const categoryInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [recipesPerPage, setRecipesPerPage] = useState(10); // Opciones: 10, 20, 50
  const [totalFilteredCount, setTotalFilteredCount] = useState(0); // Total de recetas después de FILTROS y ORDENACIÓN (antes de paginación)

  const navigate = useNavigate();

  // Función para obtener TODAS las recetas desde el backend (solo una vez al inicio)
  const fetchAllRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API_URL}/recipes`, config);
      setAllRecipes(response.data); // Guarda todas las recetas
      
      // Extraer todas las categorías únicas de todas las recetas
      const categoriesSet = new Set();
      response.data.forEach(recipe => {
        if (recipe.categories && Array.isArray(recipe.categories)) {
          recipe.categories.forEach(category => {
            if (category && category.trim()) {
              categoriesSet.add(category.trim());
            }
          });
        }
      });
      setAllCategories(Array.from(categoriesSet).sort());
      
      // No inicializamos displayedRecipes aquí, el useEffect de filtrado/paginación se encargará
    } catch (err) {
      console.error('Error al cargar todas las recetas:', err);
      setError('No se pudieron cargar las recetas. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect para llamar a fetchAllRecipes al montar el componente
  useEffect(() => {
    fetchAllRecipes();
  }, [fetchAllRecipes]);

  // Función para aplicar filtros, ordenación Y paginación en el frontend
  useEffect(() => {
    let currentRecipes = [...allRecipes]; // Trabaja con una copia de todas las recetas

    // 1. Filtrar por título (searchTerm)
    if (searchTerm) {
      currentRecipes = currentRecipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Filtrar por categorías
    if (selectedCategories.length > 0) {
      currentRecipes = currentRecipes.filter(recipe =>
        selectedCategories.every(selectedCat =>
          recipe.categories.some(recipeCat =>
            recipeCat.toLowerCase() === selectedCat.toLowerCase()
          )
        )
      );
    }

    // 3. Filtrar por autor
    if (authorFilter) {
      currentRecipes = currentRecipes.filter(recipe =>
        recipe.author?.username.toLowerCase().includes(authorFilter.toLowerCase())
      );
    }

    // 4. Ordenar
    currentRecipes.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      if (sortOrder === 'createdAt:desc') {
        return dateB - dateA; // Más recientes primero
      } else {
        return dateA - dateB; // Más antiguas primero
      }
    });

    // Guardar el total de recetas después de filtros y ordenación, antes de la paginación
    setTotalFilteredCount(currentRecipes.length);

    // 5. Aplicar Paginación
    const indexOfLastRecipe = currentPage * recipesPerPage;
    const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;

    const recipesForCurrentPage = currentRecipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
    setDisplayedRecipes(recipesForCurrentPage); // Actualiza las recetas que se mostrarán

    // Asegurarse de que la página actual no sea inválida si los filtros reducen el número total de recetas
    const calculatedTotalPages = Math.ceil(currentRecipes.length / recipesPerPage);
    if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
      setCurrentPage(calculatedTotalPages); // Si la página actual es mayor que el número total de páginas, ir a la última
    } else if (calculatedTotalPages === 0 && currentPage !== 1) {
      setCurrentPage(1); // Si no hay recetas con los filtros y no estamos en la página 1, ir a la página 1
    }

  }, [searchTerm, selectedCategories, authorFilter, sortOrder, allRecipes, currentPage, recipesPerPage]);


  // Calcular el número total de páginas (basado en totalFilteredCount)
  // Este cálculo se puede hacer aquí, ya que `totalFilteredCount` se actualiza en el `useEffect`
  const totalPages = Math.ceil(totalFilteredCount / recipesPerPage);


  // Manejadores para la paginación
  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleRecipesPerPageChange = (e) => {
    setRecipesPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1); // Resetear a la primera página cuando cambia el número de recetas por página
  };


  // Manejadores para los filtros (sin cambios)
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleAuthorFilterChange = (e) => setAuthorFilter(e.target.value);
  const handleSortChange = (e) => setSortOrder(e.target.value);

  const handleAddCategory = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedDropdownIndex >= 0 && selectedDropdownIndex < filteredCategories.length) {
        // Seleccionar desde dropdown con navegación por teclado
        addCategoryToSelected(filteredCategories[selectedDropdownIndex]);
      } else if (categoriesInput.trim() !== '') {
        // Agregar categoría escrita manualmente
        addCategoryToSelected(categoriesInput.trim());
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedDropdownIndex(prev => 
        prev < filteredCategories.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedDropdownIndex(prev => 
        prev > 0 ? prev - 1 : filteredCategories.length - 1
      );
    } else if (e.key === 'Escape') {
      setShowCategoryDropdown(false);
      setSelectedDropdownIndex(-1);
    }
  };

  // Función para añadir una categoría seleccionada
  const addCategoryToSelected = (categoryName) => {
    if (!selectedCategories.includes(categoryName)) {
      setSelectedCategories([...selectedCategories, categoryName]);
    }
    setCategoriesInput('');
    setShowCategoryDropdown(false);
    setSelectedDropdownIndex(-1);
  };

  const handleRemoveCategory = (categoryToRemove) => {
    setSelectedCategories(selectedCategories.filter(cat => cat !== categoryToRemove));
  };

  // Función para manejar el cambio en el input de categorías
  const handleCategoryInputChange = (e) => {
    const value = e.target.value;
    setCategoriesInput(value);
    setSelectedDropdownIndex(-1); // Reset navegación por teclado
    
    // Filtrar categorías disponibles (excluyendo las ya seleccionadas)
    const available = allCategories.filter(cat => 
      !selectedCategories.includes(cat) && 
      cat.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCategories(available);
    setShowCategoryDropdown(value.length > 0 && available.length > 0);
  };

  // Función para manejar el focus en el input de categorías
  const handleCategoryInputFocus = () => {
    const available = allCategories.filter(cat => !selectedCategories.includes(cat));
    setFilteredCategories(available);
    setShowCategoryDropdown(available.length > 0);
    setSelectedDropdownIndex(-1); // Reset navegación por teclado
  };

  // Función para manejar cuando se hace click fuera del dropdown
  const handleClickOutside = (e) => {
    if (
      dropdownRef.current && 
      !dropdownRef.current.contains(e.target) &&
      categoryInputRef.current &&
      !categoryInputRef.current.contains(e.target)
    ) {
      setShowCategoryDropdown(false);
    }
  };

  // Effect para manejar clicks fuera del dropdown
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Manejador para la selección de receta (navegación real)
  const handleRecipeClick = (recipeId) => {
    navigate(`/recipes/${recipeId}`);
  };

  if (loading) return <p>Cargando recetas...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="recipe-list-container">
      <h2>Explorar Recetas</h2>

      {/* Contenedor principal de filtros y ordenación, ahora más estructurado */}
      <div className="filters-and-sort">
        {/* Fila 1: Filtros principales */}
        <div className="filters-row-one">
          <div className="search-bar-group">
            <label htmlFor="search-title">Buscar por título:</label>
            <input
              id="search-title"
              type="text"
              placeholder="Escribe para buscar..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="category-input-group">
            <label htmlFor="add-category">Añadir categoría:</label>
            <div className="category-dropdown-container">
              <input
                ref={categoryInputRef}
                id="add-category"
                type="text"
                placeholder="Escribe o selecciona una categoría..."
                value={categoriesInput}
                onChange={handleCategoryInputChange}
                onFocus={handleCategoryInputFocus}
                onKeyDown={handleAddCategory}
              />
              {showCategoryDropdown && (
                <div ref={dropdownRef} className="category-dropdown">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category, index) => (
                      <div
                        key={index}
                        className={`category-dropdown-item ${
                          index === selectedDropdownIndex ? 'highlighted' : ''
                        }`}
                        onClick={() => addCategoryToSelected(category)}
                      >
                        {category}
                      </div>
                    ))
                  ) : (
                    <div className="category-dropdown-item no-results">
                      No hay categorías disponibles
                    </div>
                  )}
                </div>
              )}
            </div>
            {selectedCategories.length > 0 && (
              <div className="category-chips-container">
                {selectedCategories.map((cat, index) => (
                  <span key={index} className="category-chip">
                    {cat} <span className="remove-chip" onClick={() => handleRemoveCategory(cat)}>X</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="author-filter-group">
            <label htmlFor="filter-author">Filtrar por autor:</label>
            <input
              id="filter-author"
              type="text"
              placeholder="Nombre de usuario del autor..."
              value={authorFilter}
              onChange={handleAuthorFilterChange}
            />
          </div>

          <div className="sort-by-group">
            <label htmlFor="sortOrder">Ordenar por:</label>
            <select id="sortOrder" value={sortOrder} onChange={handleSortChange}>
              <option value="createdAt:desc">Más recientes</option>
              <option value="createdAt:asc">Más antiguas</option>
            </select>
          </div>
        </div> {/* Fin .filters-row-one */}

        {/* Fila 2: Ordenación */}
        <div className="sort-row-two">
          
        </div> {/* Fin .sort-row-two */}

        {/* Fila 3: Controles de Paginación */}
        <div className="pagination-row-three">
          <div className="pagination-controls">
            <div className="recipes-per-page-group">
              <label htmlFor="recipesPerPage">Recetas por página:</label>
              <select id="recipesPerPage" value={recipesPerPage} onChange={handleRecipesPerPageChange}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="pagination-buttons">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Anterior
              </button>
              <span>Página {currentPage} de {totalPages || 1}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="pagination-button"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div> {/* Fin .pagination-row-three */}

      </div> {/* Fin .filters-and-sort */}


      <div className="recipes-grid">
        {displayedRecipes.length === 0 && totalFilteredCount > 0 ? (
          <p>No se encontraron recetas en esta página con los filtros aplicados.</p>
        ) : displayedRecipes.length === 0 && totalFilteredCount === 0 ? (
          <p>No se encontraron recetas con los filtros aplicados.</p>
        ) : (
          displayedRecipes.map((recipe) => (
            <RecipeCard key={recipe._id} recipe={recipe} onClick={handleRecipeClick} />
          ))
        )}
      </div>

      {/* Repetir los controles de paginación al final para mejor UX */}
      {totalPages > 1 && (
        <div className="pagination-controls bottom">
          <div className="pagination-buttons">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="pagination-button"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeList;