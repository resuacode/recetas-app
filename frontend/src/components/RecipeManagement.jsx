// frontend/src/components/RecipeManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RecipeCard from './RecipeCard'; // Reutilizamos RecipeCard
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const RecipeManagement = ({ currentUser }) => {
  const [userRecipes, setUserRecipes] = useState([]);
  const [displayedRecipes, setDisplayedRecipes] = useState([]); // Recetas filtradas y paginadas
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriesInput, setCategoriesInput] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortOrder, setSortOrder] = useState('createdAt:desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Estados para el dropdown de categorías
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedDropdownIndex, setSelectedDropdownIndex] = useState(-1);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [recipesPerPage, setRecipesPerPage] = useState(10);
  const [totalFilteredCount, setTotalFilteredCount] = useState(0);

  // Refs para el manejo del dropdown
  const categoryInputRef = React.useRef(null);
  const dropdownRef = React.useRef(null);

  // Función para obtener las recetas de este usuario
  const fetchUserRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/recipes/my-recipes`);
      setUserRecipes(response.data);
      
      // Extraer todas las categorías únicas
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
      
    } catch (err) {
      console.error('Error al cargar las recetas del usuario:', err);
      toast.error('No se pudieron cargar tus recetas. Inténtalo de nuevo más tarde.');
      setError('No se pudieron cargar tus recetas. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUserRecipes();
    }
  }, [currentUser, fetchUserRecipes]);

  // useEffect para aplicar filtros, ordenación y paginación
  useEffect(() => {
    let currentRecipes = [...userRecipes];

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

    // 3. Ordenar
    const [sortField, sortDirection] = sortOrder.split(':');
    currentRecipes.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // 4. Actualizar el conteo total filtrado
    setTotalFilteredCount(currentRecipes.length);

    // 5. Aplicar paginación
    const startIndex = (currentPage - 1) * recipesPerPage;
    const endIndex = startIndex + recipesPerPage;
    const paginatedRecipes = currentRecipes.slice(startIndex, endIndex);

    setDisplayedRecipes(paginatedRecipes);
  }, [userRecipes, searchTerm, selectedCategories, sortOrder, currentPage, recipesPerPage]);

  const handleCreateNewRecipe = () => {
    // console.log('Navegar a formulario para crear nueva receta');
    navigate('/manage-recipes/new');
  };

  const handleEditRecipe = (recipeId) => {
    // console.log(`Editar receta con ID: ${recipeId}`);
    navigate(`/manage-recipes/edit/${recipeId}`);
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
      try {
        await axios.delete(`${API_URL}/recipes/${recipeId}`);
        // Actualizar la lista después de eliminar
        setUserRecipes(userRecipes.filter(recipe => recipe._id !== recipeId));
        toast.success('Receta eliminada correctamente.');
      } catch (err) {
        console.error('Error al eliminar la receta:', err);
        toast.error('No se pudo eliminar la receta. Asegúrate de tener permisos.');
      }
    }
  };

  // Funciones para manejo de categorías
  const handleCategoriesInputChange = (e) => {
    const value = e.target.value;
    setCategoriesInput(value);
    
    if (value.trim()) {
      const filtered = allCategories.filter(category =>
        category.toLowerCase().includes(value.toLowerCase()) &&
        !selectedCategories.includes(category)
      );
      setFilteredCategories(filtered);
      setShowCategoryDropdown(true);
    } else {
      setShowCategoryDropdown(false);
      setFilteredCategories([]);
    }
    setSelectedDropdownIndex(-1);
  };

  const selectCategoryFromDropdown = (category) => {
    if (!selectedCategories.includes(category)) {
      setSelectedCategories([...selectedCategories, category]);
    }
    setCategoriesInput('');
    setShowCategoryDropdown(false);
    setFilteredCategories([]);
    setSelectedDropdownIndex(-1);
    setCurrentPage(1);
  };

  const removeSelectedCategory = (categoryToRemove) => {
    setSelectedCategories(selectedCategories.filter(cat => cat !== categoryToRemove));
    setCurrentPage(1);
  };

  const handleCategoryKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedDropdownIndex(prev => 
        prev < filteredCategories.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedDropdownIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedDropdownIndex >= 0 && filteredCategories[selectedDropdownIndex]) {
        selectCategoryFromDropdown(filteredCategories[selectedDropdownIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowCategoryDropdown(false);
      setSelectedDropdownIndex(-1);
    }
  };

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setSearchTerm('');
    setCategoriesInput('');
    setSelectedCategories([]);
    setSortOrder('createdAt:desc');
    setCurrentPage(1);
    setShowCategoryDropdown(false);
  };

  const handleRecipeClick = (recipeId) => {
    // Redirige a la vista de detalle cuando se hace clic en la tarjeta
    navigate(`/recipes/${recipeId}`);
  };

  // Función para calcular las categorías más populares
  const getTopCategories = (recipes, limit = 3) => {
    const categoryCount = {};
    
    // Contar las categorías de todas las recetas
    recipes.forEach(recipe => {
      if (recipe.categories && Array.isArray(recipe.categories)) {
        recipe.categories.forEach(category => {
          if (category && category.trim()) {
            const normalizedCategory = category.trim();
            categoryCount[normalizedCategory] = (categoryCount[normalizedCategory] || 0) + 1;
          }
        });
      }
    });

    // Convertir a array y ordenar por frecuencia
    const sortedCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit);

    return sortedCategories;
  };

  // Función para obtener información de la primera receta
  const getFirstRecipeInfo = (recipes) => {
    if (recipes.length === 0) return null;
    
    // Ordenar por fecha de creación (más antigua primero)
    const sortedByDate = recipes
      .filter(recipe => recipe.createdAt) // Asegurar que tenga fecha
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    if (sortedByDate.length === 0) return null;
    
    const firstRecipe = sortedByDate[0];
    const createdDate = new Date(firstRecipe.createdAt);
    
    // Formatear la fecha de manera legible
    const formattedDate = createdDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return {
      date: formattedDate,
      title: firstRecipe.title,
      id: firstRecipe._id
    };
  };

  // Calcular estadísticas
  const totalRecipes = userRecipes.length;
  const topCategories = getTopCategories(userRecipes);
  const firstRecipeInfo = getFirstRecipeInfo(userRecipes);

  // Cálculos para paginación
  const totalPages = Math.ceil(totalFilteredCount / recipesPerPage);
  const startIndex = (currentPage - 1) * recipesPerPage + 1;
  const endIndex = Math.min(currentPage * recipesPerPage, totalFilteredCount);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRecipesPerPageChange = (newPerPage) => {
    setRecipesPerPage(newPerPage);
    setCurrentPage(1);
  };

  if (!currentUser) return <p>Acceso denegado. No se ha encontrado el usuario.</p>;
  if (loading) return <p className="loading-message">Cargando tus recetas...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="recipe-management-container">
      <h2>Gestión de Mis Recetas</h2>

      <button onClick={handleCreateNewRecipe} className="create-recipe-button">
        Crear Nueva Receta
      </button>

      {/* Sección de filtros y búsqueda */}
      {userRecipes.length > 0 && (
        <div className="filters-container">
          <div className="search-bar-row">
            {/* Búsqueda por título */}
            <div className="search-container">
              <input
                type="text"
                placeholder="Buscar por título..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="search-input"
              />
            </div>
            <button
              type="button"
              className="toggle-advanced-filters-button"
              onClick={() => setShowAdvancedFilters(prev => !prev)}
              aria-expanded={showAdvancedFilters}
            >
              {showAdvancedFilters ? '▲ Ocultar filtros avanzados' : '▼ Búsqueda avanzada'}
              {!showAdvancedFilters && (selectedCategories.length + (sortOrder !== 'createdAt:desc' ? 1 : 0)) > 0 && (
                <span className="advanced-filters-badge">
                  {selectedCategories.length + (sortOrder !== 'createdAt:desc' ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {showAdvancedFilters && (
          <div className="filters-row">
            {/* Filtro por categorías con dropdown */}
            <div className="category-filter-container" ref={dropdownRef}>
              
              
              <input
                ref={categoryInputRef}
                type="text"
                placeholder={selectedCategories.length > 0 ? "Añadir otra categoría..." : "Filtrar por categorías..."}
                value={categoriesInput}
                onChange={handleCategoriesInputChange}
                onKeyDown={handleCategoryKeyDown}
                onFocus={() => {
                  if (allCategories.length > 0 && categoriesInput.trim()) {
                    setShowCategoryDropdown(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowCategoryDropdown(false), 200);
                }}
                className="category-input"
              />
              
              {showCategoryDropdown && filteredCategories.length > 0 && (
                <div className="category-dropdown">
                  {filteredCategories.map((category, index) => (
                    <div
                      key={category}
                      className={`dropdown-item ${index === selectedDropdownIndex ? 'highlighted' : ''}`}
                      onClick={() => selectCategoryFromDropdown(category)}
                    >
                      {category}
                    </div>
                  ))}
                </div>
              )}

              <div className="selected-categories">
                {selectedCategories.map((category, index) => (
                  <span key={index} className="selected-category-tag">
                    {category}
                    <button
                      type="button"
                      onClick={() => removeSelectedCategory(category)}
                      className="remove-category-btn"
                      aria-label="Eliminar categoría"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Ordenación */}
            <div className="sort-container">
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setCurrentPage(1);
                }}
                className="sort-select"
              >
                <option value="createdAt:desc">Más recientes</option>
                <option value="createdAt:asc">Más antiguas</option>
                <option value="title:asc">Título A-Z</option>
                <option value="title:desc">Título Z-A</option>
              </select>
            </div>

            {/* Botón limpiar filtros - siempre visible */}
            <button 
              onClick={clearAllFilters} 
              className={`clear-filters-btn ${!(searchTerm || selectedCategories.length > 0 || sortOrder !== 'createdAt:desc') ? 'disabled' : ''}`}
              disabled={!(searchTerm || selectedCategories.length > 0 || sortOrder !== 'createdAt:desc')}
            >
              Limpiar Filtros
            </button>
          </div>
          )}

          {/* Información de resultados y paginación */}
          <div className="results-info">
            <div className="results-count">
              {totalFilteredCount > 0 ? (
                <>
                  Mostrando {startIndex}-{endIndex} de {totalFilteredCount} receta{totalFilteredCount !== 1 ? 's' : ''}
                  {(searchTerm || selectedCategories.length > 0) && ` (filtradas de ${totalRecipes} total${totalRecipes !== 1 ? 'es' : ''})`}
                </>
              ) : (
                <>No se encontraron recetas con los filtros aplicados</>
              )}
            </div>
            
            {totalFilteredCount > 10 && (
              <div className="recipes-per-page">
                <label>
                  Mostrar:
                  <select
                    value={recipesPerPage}
                    onChange={(e) => handleRecipesPerPageChange(Number(e.target.value))}
                    className="per-page-select"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  por página
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="my-recipes-list">
        {userRecipes.length === 0 ? (
          <p>Aún no has añadido ninguna receta.</p>
        ) : totalFilteredCount === 0 ? (
          <p>No se encontraron recetas con los filtros aplicados. <button onClick={clearAllFilters} className="link-button">Limpiar filtros</button></p>
        ) : (
          displayedRecipes.map((recipe) => (
            <div key={recipe._id} className="management-recipe-item">
              <RecipeCard 
                recipe={recipe} 
                onClick={handleRecipeClick} 
                isLoggedIn={true}
                onFavoriteChange={() => {}} // Callback vacío para RecipeManagement
              />
              <div className="management-buttons">
                <button onClick={() => handleEditRecipe(recipe._id)} className="edit-button">Editar</button>
                <button onClick={() => handleDeleteRecipe(recipe._id)} className="delete-button">Borrar</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              ← Anterior
            </button>
            
            <div className="page-numbers">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* Sección de estadísticas - solo se muestra si hay recetas */}
      {userRecipes.length > 0 && (
        <div className="user-stats-section">
          <h3>📊 Resumen de tus Contribuciones</h3>
          
          <div className="stats-container">
            <div className="stat-item total-recipes">
              <div className="stat-number">{totalRecipes}</div>
              <div className="stat-label">
                {totalRecipes === 1 ? 'Receta Creada' : 'Recetas Creadas'}
              </div>
            </div>

            <div className="stat-item top-categories">
              <div className="stat-label">Tus Categorías Favoritas:</div>
              <div className="categories-list">
                {topCategories.length > 0 ? (
                  topCategories.map(([category, count], index) => (
                    <div key={category} className="category-stat">
                      <span className="category-rank">#{index + 1}</span>
                      <span className="category-name">{category}</span>
                      <span className="category-count">({count} {count === 1 ? 'receta' : 'recetas'})</span>
                    </div>
                  ))
                ) : (
                  <span className="no-categories">No hay categorías disponibles</span>
                )}
              </div>
            </div>
          </div>

          {/* Información de la primera receta */}
          {firstRecipeInfo && (
            <div className="first-recipe-info">
              <p className="contributing-since">
                🎂 Contribuyendo desde <strong>{firstRecipeInfo.date}</strong> con{' '}
                <span 
                  className="first-recipe-link"
                  onClick={() => navigate(`/recipes/${firstRecipeInfo.id}`)}
                  title="Ver receta"
                >
                  "{firstRecipeInfo.title}"
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecipeManagement;