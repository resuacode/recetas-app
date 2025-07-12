// frontend/src/components/RecipeList.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react'; // Importa useRef
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RecipeCard from './RecipeCard';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const RecipeList = () => {
  const [allRecipes, setAllRecipes] = useState([]); // Almacena todas las recetas
  const [filteredRecipes, setFilteredRecipes] = useState([]); // Las recetas que se muestran
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para filtros y ordenación
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriesInput, setCategoriesInput] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [authorFilter, setAuthorFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('createdAt:desc'); // 'createdAt:desc' (más recientes), 'createdAt:asc' (más antiguas)

  // Ref para el timeout del debouncing
  const debounceTimeoutRef = useRef(null);

  const navigate = useNavigate(); // Inicializa useNavigate

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
      // No se envían parámetros de filtro aquí para obtener todas las recetas
      const response = await axios.get(`${API_URL}/recipes`, config);
      setAllRecipes(response.data); // Guarda todas las recetas
      setFilteredRecipes(response.data); // Inicialmente, las filtradas son todas
    } catch (err) {
      console.error('Error al cargar todas las recetas:', err);
      setError('No se pudieron cargar las recetas. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }, []); // Dependencias vacías: solo se ejecuta una vez al montar

  // useEffect para llamar a fetchAllRecipes al montar el componente
  useEffect(() => {
    fetchAllRecipes();
  }, [fetchAllRecipes]);

  // Función para aplicar filtros y ordenación en el frontend
  // Se ejecuta cada vez que cambian los estados de filtro/orden
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

    setFilteredRecipes(currentRecipes);
  }, [searchTerm, selectedCategories, authorFilter, sortOrder, allRecipes]);


  // Manejadores para los filtros
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value); // Actualiza el estado inmediatamente

    // Limpia el timeout anterior si existe
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    // No necesitamos debouncing si el filtrado es local, ¡este cambio no es necesario aquí!
    // Lo dejé para referencia si en el futuro decides volver a llamar a la API
  };

  const handleAuthorFilterChange = (e) => setAuthorFilter(e.target.value);
  const handleSortChange = (e) => setSortOrder(e.target.value);

  const handleAddCategory = (e) => {
    if (e.key === 'Enter' && categoriesInput.trim() !== '') {
      const newCategory = categoriesInput.trim();
      if (!selectedCategories.includes(newCategory)) {
        setSelectedCategories([...selectedCategories, newCategory]);
      }
      setCategoriesInput(''); // Limpiar el input después de añadir
    }
  };

  const handleRemoveCategory = (categoryToRemove) => {
    setSelectedCategories(selectedCategories.filter(cat => cat !== categoryToRemove));
  };

  // Manejador para la selección de receta (navegación real)
  const handleRecipeClick = (recipeId) => {
    navigate(`/recipes/${recipeId}`); // ¡Navega a la ruta de detalle!
  };

  if (loading) return <p>Cargando recetas...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="recipe-list-container">
      <h2>Explorar Recetas</h2>

      <div className="filters-and-sort">
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
          <input
            id="add-category"
            type="text"
            placeholder="Presiona Enter para añadir"
            value={categoriesInput}
            onChange={(e) => setCategoriesInput(e.target.value)}
            onKeyPress={handleAddCategory}
          />
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
        
        <div className="author-filter-group"> {/* Nuevo grupo para el filtro de autor */}
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
      </div>

      <div className="recipes-grid">
        {filteredRecipes.length === 0 ? (
          <p>No se encontraron recetas con los filtros aplicados.</p>
        ) : (
          filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe._id} recipe={recipe} onClick={handleRecipeClick} />
          ))
        )}
      </div>
    </div>
  );
};

export default RecipeList;