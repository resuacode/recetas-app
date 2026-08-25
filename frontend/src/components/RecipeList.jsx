import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RecipeCard from './RecipeCard';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const RecipeList = ({ isLoggedIn }) => {
  const [allRecipes, setAllRecipes] = useState([]); // Almacena todas las recetas del backend
  const [displayedRecipes, setDisplayedRecipes] = useState([]); // Las recetas que se muestran en la página actual (después de filtros, orden y paginación)
  const [userFavorites, setUserFavorites] = useState([]); // IDs de recetas favoritas del usuario
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para filtros y ordenación
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [categoriesInput, setCategoriesInput] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [authorFilter, setAuthorFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('any'); // any | short | medium | long
  const [servingsFilter, setServingsFilter] = useState('any'); // any | 1-2 | 3-4 | 5+
  const [sortOrder, setSortOrder] = useState('createdAt:desc');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showFullWelcome, setShowFullWelcome] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Estados para el dropdown de categorías
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedDropdownIndex, setSelectedDropdownIndex] = useState(-1);

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
      const response = await axios.get(`${API_URL}/recipes`);
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

  // Función para obtener los favoritos del usuario
  const fetchUserFavorites = useCallback(async () => {
    if (!isLoggedIn) {
      setUserFavorites([]);
      return;
    }
    
    try {
      const response = await axios.get(`${API_URL}/favorites`);
      const favoriteIds = response.data.map(fav => fav._id);
      setUserFavorites(favoriteIds);
    } catch (err) {
      console.error('Error al cargar favoritos:', err);
      // No mostrar error al usuario, simplemente no cargar favoritos
      setUserFavorites([]);
    }
  }, [isLoggedIn]);

  // useEffect para llamar a fetchAllRecipes al montar el componente
  useEffect(() => {
    fetchAllRecipes();
  }, [fetchAllRecipes]);

  // useEffect para cargar favoritos cuando cambia el estado de login
  useEffect(() => {
    fetchUserFavorites();
  }, [fetchUserFavorites]);

  // Debounce del término de búsqueda para no re-filtrar en cada pulsación
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Vuelve a la página 1 cada vez que cambia algún filtro u orden (no al paginar/cambiar tamaño de página)
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCategories, authorFilter, durationFilter, servingsFilter, sortOrder, showFavoritesOnly]);

  // Devuelve el bucket de duración total (prepTime + cookTime) de una receta, o null si no tiene datos
  const getDurationBucket = (recipe) => {
    if (recipe.prepTime == null && recipe.cookTime == null) return null;
    const total = (recipe.prepTime || 0) + (recipe.cookTime || 0);
    if (total <= 30) return 'short';
    if (total <= 60) return 'medium';
    return 'long';
  };

  // Devuelve el bucket de comensales de una receta, o null si no tiene datos
  const getServingsBucket = (recipe) => {
    if (recipe.servings == null) return null;
    if (recipe.servings <= 2) return '1-2';
    if (recipe.servings <= 4) return '3-4';
    return '5+';
  };

  // Función para aplicar filtros, ordenación Y paginación en el frontend
  useEffect(() => {
    let currentRecipes = [...allRecipes]; // Trabaja con una copia de todas las recetas

    // 1. Filtrar por favoritos si está activado
    if (showFavoritesOnly && isLoggedIn) {
      currentRecipes = currentRecipes.filter(recipe =>
        userFavorites.includes(recipe._id)
      );
    }

    // 2. Filtrar por término de búsqueda (título, descripción o ingredientes)
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      currentRecipes = currentRecipes.filter(recipe =>
        recipe.title.toLowerCase().includes(term) ||
        recipe.description?.toLowerCase().includes(term) ||
        recipe.ingredients?.some(ing => ing.name?.toLowerCase().includes(term))
      );
    }

    // 3. Filtrar por categorías
    if (selectedCategories.length > 0) {
      currentRecipes = currentRecipes.filter(recipe =>
        selectedCategories.every(selectedCat =>
          recipe.categories.some(recipeCat =>
            recipeCat.toLowerCase() === selectedCat.toLowerCase()
          )
        )
      );
    }

    // 4. Filtrar por autor
    if (authorFilter) {
      currentRecipes = currentRecipes.filter(recipe =>
        recipe.author?.username.toLowerCase().includes(authorFilter.toLowerCase())
      );
    }

    // 5. Filtrar por duración total (preparación + cocción)
    if (durationFilter !== 'any') {
      currentRecipes = currentRecipes.filter(recipe => getDurationBucket(recipe) === durationFilter);
    }

    // 6. Filtrar por número de comensales
    if (servingsFilter !== 'any') {
      currentRecipes = currentRecipes.filter(recipe => getServingsBucket(recipe) === servingsFilter);
    }

    // 7. Ordenar
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

    // 8. Aplicar Paginación
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

  }, [debouncedSearchTerm, selectedCategories, authorFilter, durationFilter, servingsFilter, sortOrder, allRecipes, currentPage, recipesPerPage, showFavoritesOnly, userFavorites, isLoggedIn]);


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


  // Manejadores para los filtros
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleAuthorFilterChange = (e) => setAuthorFilter(e.target.value);
  const handleSortChange = (e) => setSortOrder(e.target.value);
  const handleDurationFilterChange = (e) => setDurationFilter(e.target.value);
  const handleServingsFilterChange = (e) => setServingsFilter(e.target.value);

  // Comprueba si hay algún filtro activo (para mostrar chips/reset y mensajes contextuales)
  const hasActiveFilters = Boolean(
    debouncedSearchTerm ||
    selectedCategories.length > 0 ||
    authorFilter ||
    durationFilter !== 'any' ||
    servingsFilter !== 'any' ||
    showFavoritesOnly
  );

  // Nº de filtros avanzados activos (no cuenta la búsqueda simple, que siempre está visible)
  const activeAdvancedFiltersCount =
    selectedCategories.length +
    (authorFilter ? 1 : 0) +
    (durationFilter !== 'any' ? 1 : 0) +
    (servingsFilter !== 'any' ? 1 : 0) +
    (showFavoritesOnly ? 1 : 0);

  // Restablece todos los filtros a sus valores por defecto
  const handleClearAllFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setSelectedCategories([]);
    setCategoriesInput('');
    setAuthorFilter('');
    setDurationFilter('any');
    setServingsFilter('any');
    setShowFavoritesOnly(false);
  };

  const durationFilterLabels = {
    short: 'Hasta 30 min',
    medium: '30-60 min',
    long: 'Más de 60 min',
  };

  const servingsFilterLabels = {
    '1-2': '1-2 comensales',
    '3-4': '3-4 comensales',
    '5+': '5+ comensales',
  };

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

  // Manejador para cambios en favoritos
  const handleFavoriteChange = (recipeId, isFavorite) => {
    if (isFavorite) {
      // Añadir a favoritos si no está ya
      if (!userFavorites.includes(recipeId)) {
        setUserFavorites(prev => [...prev, recipeId]);
      }
    } else {
      // Quitar de favoritos
      setUserFavorites(prev => prev.filter(id => id !== recipeId));
    }
  };

  if (loading) return (
      <div className="loading-block">
        <p className="loading-message">Cargando recetas...</p>
        <p className="loading-message">
          Esto podría tardar hasta unos 30 segundos si hace tiempo que no entras en la web, esto es un proyecto gratuito y el servidor puede tardar en arrancar, ten paciencia por favor ;)
        </p>
      </div>
    );
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="recipe-list-container">
      
      {/* Mensaje de bienvenida para usuarios no logueados */}
      {!isLoggedIn && (
        <div className={`welcome-message ${showFullWelcome ? 'expanded' : ''}`}>
          <p className="welcome-message-title">¡Bienvenido a Rescetario by dr.eats! 🍳</p>
          <p>Esta web nació con la única finalidad de almacenar y tener un acceso rápido y cómodo a mis recetas favoritas.</p>
          {showFullWelcome && (
            <>
              <p>Estas recetas son fruto de ir probando multitud de platos, algunos de mi propia invención y otros de colaboradores de la web, otros son sacados de libros o de internet.
                <br />
                Siempre que una receta sea una versión o esté basada en otra existente, lo indicamos en la propia receta.
                <br />
                No somos profesionales, simplemente unos aficionados a la cocina que disfrutan experimentando y compartiendo sus hallazgos culinarios.
              </p>
              <p>Siéntete libre de explorar nuestra colección de recetas, está en constante evolución. <strong>Regístrate</strong> para poder guardar favoritos.</p>
              <p>¡Espero que disfrutes de tu experiencia en el Rescetario!</p>
              <p>Si quieres comentarme cualquier cosa, no dudes en hacerlo, puedes contactarme vía Instagram <a href="https://www.instagram.com/dr.eats32" target="_blank" rel="noopener noreferrer">@dr.eats32</a></p>
            </>
          )}
          <button
            type="button"
            className="welcome-message-toggle"
            onClick={() => setShowFullWelcome(prev => !prev)}
          >
            {showFullWelcome ? 'Leer menos' : 'Leer más'}
          </button>
        </div>
      )}

      <h2>Explorar Recetas</h2>

      {/* Contenedor principal de filtros y ordenación, ahora como toolbar moderna */}
      <div className="filters-and-sort">
        <div className="search-bar-row">
          <div className="search-bar-group search-bar-group--main">
            <label htmlFor="search-title">Buscar recetas</label>
            <div className="search-input-wrapper">
              <span className="search-icon" aria-hidden="true">🔍</span>
              <input
                id="search-title"
                type="text"
                placeholder="Busca por título, descripción o ingrediente..."
                value={searchTerm}
                onChange={handleSearchChange}
                aria-label="Buscar recetas por título, descripción o ingrediente"
              />
            </div>
          </div>
          <button
            type="button"
            className="toggle-advanced-filters-button"
            onClick={() => setShowAdvancedFilters(prev => !prev)}
            aria-expanded={showAdvancedFilters}
          >
            {showAdvancedFilters ? '▲ Ocultar filtros avanzados' : '▼ Búsqueda avanzada'}
            {!showAdvancedFilters && activeAdvancedFiltersCount > 0 && (
              <span className="advanced-filters-badge">{activeAdvancedFiltersCount}</span>
            )}
          </button>
        </div>

        {/* Fila de filtros compactos (colapsable) */}
        {showAdvancedFilters && (
        <div className="filters-row-one">
          <div className="category-input-group">
            <label htmlFor="add-category">Categorías</label>
            <div className="category-dropdown-container">
              <input
                ref={categoryInputRef}
                id="add-category"
                type="text"
                placeholder="Escribe o selecciona..."
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
          </div>

          <div className="author-filter-group">
            <label htmlFor="filter-author">Autor</label>
            <input
              id="filter-author"
              type="text"
              placeholder="Nombre de usuario..."
              value={authorFilter}
              onChange={handleAuthorFilterChange}
            />
          </div>

          <div className="duration-filter-group">
            <label htmlFor="filter-duration">Duración</label>
            <select id="filter-duration" value={durationFilter} onChange={handleDurationFilterChange}>
              <option value="any">Cualquier duración</option>
              <option value="short">Hasta 30 min</option>
              <option value="medium">30-60 min</option>
              <option value="long">Más de 60 min</option>
            </select>
          </div>

          <div className="servings-filter-group">
            <label htmlFor="filter-servings">Comensales</label>
            <select id="filter-servings" value={servingsFilter} onChange={handleServingsFilterChange}>
              <option value="any">Cualquier cantidad</option>
              <option value="1-2">1-2</option>
              <option value="3-4">3-4</option>
              <option value="5+">5+</option>
            </select>
          </div>

          <div className="sort-by-group">
            <label htmlFor="sortOrder">Ordenar por</label>
            <select id="sortOrder" value={sortOrder} onChange={handleSortChange}>
              <option value="createdAt:desc">Más recientes</option>
              <option value="createdAt:asc">Más antiguas</option>
            </select>
          </div>

          {isLoggedIn && (
            <div className="favorites-filter-group">
              <label htmlFor="favorites-only">
                <input
                  id="favorites-only"
                  type="checkbox"
                  checked={showFavoritesOnly}
                  onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                />
                Solo favoritos ❤️
              </label>
            </div>
          )}

          <div className="recipes-per-page-group">
            <label htmlFor="recipesPerPage">Por página</label>
            <select id="recipesPerPage" value={recipesPerPage} onChange={handleRecipesPerPageChange}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        )} {/* Fin .filters-row-one */}

        {/* Barra de filtros activos + contador de resultados */}
        {(hasActiveFilters || totalFilteredCount > 0) && (
          <div className="active-filters-bar">
            {hasActiveFilters && (
              <div className="active-filters-chips">
                {selectedCategories.map((cat) => (
                  <span key={`cat-${cat}`} className="category-chip">
                    {cat} <span className="remove-chip" onClick={() => handleRemoveCategory(cat)}>×</span>
                  </span>
                ))}
                {authorFilter && (
                  <span className="category-chip">
                    Autor: {authorFilter} <span className="remove-chip" onClick={() => setAuthorFilter('')}>×</span>
                  </span>
                )}
                {durationFilter !== 'any' && (
                  <span className="category-chip">
                    {durationFilterLabels[durationFilter]} <span className="remove-chip" onClick={() => setDurationFilter('any')}>×</span>
                  </span>
                )}
                {servingsFilter !== 'any' && (
                  <span className="category-chip">
                    {servingsFilterLabels[servingsFilter]} <span className="remove-chip" onClick={() => setServingsFilter('any')}>×</span>
                  </span>
                )}
                {showFavoritesOnly && (
                  <span className="category-chip">
                    Solo favoritos <span className="remove-chip" onClick={() => setShowFavoritesOnly(false)}>×</span>
                  </span>
                )}
                <button type="button" className="clear-all-filters-button" onClick={handleClearAllFilters}>
                  Limpiar todo
                </button>
              </div>
            )}
            <p className="results-count" aria-live="polite">
              Mostrando {displayedRecipes.length} de {totalFilteredCount} {totalFilteredCount === 1 ? 'receta' : 'recetas'}
            </p>
          </div>
        )}

      </div> {/* Fin .filters-and-sort */}


      <div className="recipes-grid">
        {displayedRecipes.length === 0 && (
          <div className="empty-state">
            {hasActiveFilters ? (
              <>
                <p>No hay recetas que coincidan con tus filtros.</p>
                <button type="button" className="clear-all-filters-button" onClick={handleClearAllFilters}>
                  Limpiar filtros
                </button>
              </>
            ) : (
              <p>Aún no hay recetas registradas.</p>
            )}
          </div>
        )}
        {displayedRecipes.map((recipe) => (
          <RecipeCard 
            key={recipe._id} 
            recipe={recipe} 
            onClick={handleRecipeClick}
            isLoggedIn={isLoggedIn}
            onFavoriteChange={handleFavoriteChange}
          />
        ))}
      </div>

      {/* Controles de paginación (único bloque, al final de la lista) */}
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