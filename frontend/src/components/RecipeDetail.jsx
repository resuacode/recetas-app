// frontend/src/components/RecipeDetail.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Importa useParams y useNavigate
import axios from 'axios';
import toast from 'react-hot-toast';
import FavoriteButton from './FavoriteButton';
import RatingDisplay from './RatingDisplay';
import RatingInput from './RatingInput';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const RecipeDetail = ({ isLoggedIn }) => {
  const { id } = useParams(); // Obtiene el ID de la URL
  const navigate = useNavigate(); // Para volver a la lista si es necesario
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratings, setRatings] = useState({ average: 0, count: 0 });
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfStatusText, setPdfStatusText] = useState('');
  const pdfContentRef = useRef(null);
  const html2pdfLoaderRef = useRef(null);

  // Función auxiliar para mostrar fracciones de forma más elegante
  const formatQuantity = (quantity) => {
    if (!quantity) return '';
    
    const str = quantity.toString().trim();
    
    // Reemplazar fracciones comunes con símbolos Unicode
    const fractionMap = {
      '1/2': '½',
      '1/3': '⅓',
      '2/3': '⅔',
      '1/4': '¼',
      '3/4': '¾',
      '1/8': '⅛',
      '3/8': '⅜',
      '5/8': '⅝',
      '7/8': '⅞',
      '1/5': '⅕',
      '2/5': '⅖',
      '3/5': '⅗',
      '4/5': '⅘',
      '1/6': '⅙',
      '5/6': '⅚'
    };
    
    // Si es una fracción mixta (ej: "2 1/2"), separar y convertir
    if (/^\d+\s+\d+\/\d+$/.test(str)) {
      const [whole, fraction] = str.split(' ');
      const unicodeFraction = fractionMap[fraction] || fraction;
      return `${whole} ${unicodeFraction}`;
    }
    
    // Si es solo una fracción simple
    return fractionMap[str] || str;
  };

  const fetchRecipeDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/recipes/${id}`);
      setRecipe(response.data);
    } catch (err) {
      console.error('Error al cargar detalle de la receta:', err);
      setError('No se pudo cargar el detalle de la receta. Asegúrate de que existe o inténtalo más tarde.');
      // Opcional: Si la receta no se encuentra o hay un error, puedes redirigir
      // navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id]); // Dependencia del ID de la URL

  const fetchRatings = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/ratings/recipe/${id}`);
      setRatings({
        average: response.data.average,
        count: response.data.count,
      });
    } catch (err) {
      console.error('Error al cargar ratings:', err);
    }
  }, [id]);

  useEffect(() => {
    fetchRecipeDetail();
    fetchRatings();
  }, [fetchRecipeDetail, fetchRatings]);

  useEffect(() => {
    const preloadHtml2Pdf = () => {
      if (!html2pdfLoaderRef.current) {
        html2pdfLoaderRef.current = import('html2pdf.js');
      }
    };

    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(preloadHtml2Pdf, { timeout: 2000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(preloadHtml2Pdf, 1200);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleShareRecipe = useCallback(async () => {
    if (!recipe) return;

    const shareMessage = `Descubre esta fantastica receta de ${recipe.title} en el Recetario by dr.eats`;
    const shareUrl = window.location.href;
    const shareData = {
      title: recipe.title,
      text: shareMessage,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      const fallbackText = `${shareMessage}\n${shareUrl}`;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(fallbackText);
        toast.success('Enlace copiado para compartir');
        return;
      }

      window.prompt('Copia y comparte esta receta:', fallbackText);
    } catch (err) {
      if (err?.name !== 'AbortError') {
        toast.error('No se pudo compartir la receta');
      }
    }
  }, [recipe]);

  const getIngredientLine = useCallback((ingredient) => {
    const hasQuantity = ingredient.quantity && ingredient.quantity.toString().trim() !== '';
    const hasUnit = ingredient.unit && ingredient.unit.trim() !== '';
    const formattedQuantity = formatQuantity(ingredient.quantity);

    if (hasQuantity && hasUnit) {
      return `${formattedQuantity} ${ingredient.unit} de ${ingredient.name}`;
    }

    if (hasQuantity && !hasUnit) {
      return `${formattedQuantity} ${ingredient.name}`;
    }

    if (!hasQuantity && hasUnit) {
      return `${ingredient.unit} de ${ingredient.name}`;
    }

    return ingredient.name;
  }, []);

  const handleDownloadPdf = useCallback(async () => {
    if (!recipe || !pdfContentRef.current) {
      return;
    }

    setIsDownloadingPdf(true);
    setPdfStatusText('Preparando contenido para descargar...');
    const toastId = toast.loading('Preparando PDF...');

    try {
      const html2pdfPromise = html2pdfLoaderRef.current || import('html2pdf.js');
      html2pdfLoaderRef.current = html2pdfPromise;
      const html2pdfModule = await html2pdfPromise;
      const html2pdf = html2pdfModule.default;
      const fileName = `receta-${recipe.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'sin-titulo'}.pdf`;

      setPdfStatusText('Generando PDF...');
      toast.loading('Generando PDF...', { id: toastId });

      await html2pdf()
        .from(pdfContentRef.current)
        .set({
          margin: [12, 12, 12, 12],
          filename: fileName,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
          },
          pagebreak: {
            mode: ['avoid-all', 'css', 'legacy'],
          },
        })
        .save();

      toast.success('PDF descargado correctamente', { id: toastId });
    } catch (err) {
      console.error('Error al descargar PDF:', err);
      toast.error('No se pudo generar el PDF de la receta', { id: toastId });
    } finally {
      setIsDownloadingPdf(false);
      setPdfStatusText('');
    }
  }, [recipe]);

  if (loading) return <p className="loading-message">Cargando detalles de la receta...</p>;
  if (error) return (
    <div className="error-container">
      <p className="error-message">{error}</p>
      <button onClick={() => navigate('/')} className="back-button">Volver a la lista de recetas</button>
    </div>
  );
  if (!recipe) return <p className="not-found-message">Receta no encontrada.</p>; // Esto podría pasar si el fetch devuelve null por algún motivo

// Función auxiliar para verificar si un valor es "presente" para mostrarlo
  const isPresent = (value) => {
    // Para números, chequea si no es null/undefined y es un número válido
    if (typeof value === 'number') {
      return value !== null && value !== undefined && !isNaN(value);
    }
    // Para strings, chequea si no es null/undefined y no está vacío después de trim
    if (typeof value === 'string') {
      return value !== null && value !== undefined && value.trim() !== '';
    }
    // Para arrays, chequea si no es null/undefined y tiene elementos
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return false; // Otros tipos no se consideran "presentes"
  };

  return (
    <div className="recipe-detail-container">
      <div className="recipe-header">
        <h2>{recipe.title}</h2>
        <div className="recipe-header-actions">
          <FavoriteButton 
            recipeId={recipe._id} 
            isLoggedIn={isLoggedIn} 
            size="large"
            onFavoriteChange={() => {}} // Callback vacío para RecipeDetail
          />
          <button
            type="button"
            className="icon-action-button share-button"
            onClick={handleShareRecipe}
            title="Compartir receta"
            aria-label="Compartir receta"
          >
            <span className="icon-action" aria-hidden="true">📤</span>
          </button>
          <button
            type="button"
            className="icon-action-button download-pdf-button"
            onClick={handleDownloadPdf}
            title="Descargar receta en PDF"
            aria-label="Descargar receta en PDF"
            disabled={isDownloadingPdf}
          >
            <span className="icon-action" aria-hidden="true">
              {isDownloadingPdf ? '⏳' : '📄'}
            </span>
          </button>
        </div>
      </div>
      {pdfStatusText && (
        <p className="pdf-status-message" role="status" aria-live="polite">
          {pdfStatusText}
        </p>
      )}
      <RatingDisplay average={ratings.average} count={ratings.count} />
      <p className="recipe-description">{recipe.description}</p>

      {/* Mostrar "basado en" solo si existe y no está vacío/nulo */}
      {recipe.basedOn && recipe.basedOn.trim() !== '' && (
        <p className="recipe-based-on">Basado en: {recipe.basedOn}</p>
      )}

      {/* Mostrar imágenes si existen */}
      {recipe.imagesUrl && recipe.imagesUrl.length > 0 && (
        <div className="recipe-images">
          {recipe.imagesUrl.map((image, index) => (
            <img key={index} src={image} alt={`Imagen de ${recipe.title} ${index + 1}`} className="recipe-image" />
          ))}
        </div>
      )}

      {/* Mostrar video de TikTok/Instagram si existe */}
      {isPresent(recipe.videoUrl) && (
        <div className="recipe-video">
          <h3>Video de la Receta:</h3>
          {/* Usamos un iframe para incrustar el video */}
          <iframe
            src={recipe.videoUrl}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="recipe-video-iframe"
            title="Video de la receta"
          ></iframe>
        </div>
      )}

      {/* Lista de Ingredientes */}
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <div className="recipe-ingredients">
          <h3>Ingredientes:</h3>
          <ul>
            {recipe.ingredients.map((ingredient, index) => {
              return <li key={index}>{getIngredientLine(ingredient)}</li>;
            })}
          </ul>
        </div>
      )}

      {/* Paso a Paso */}
     {isPresent(recipe.instructions) && (
        <div className="recipe-instructions">
        <h3>Preparación:</h3>
        <ol>
            {recipe.instructions.map((inst, index) => ( // Cambiado a 'inst' para mayor claridad
            <li key={index} dangerouslySetInnerHTML={{ __html: inst.step }}></li> 
            ))}
        </ol>
        </div>
    )}

        <div className="recipe-meta-section">
        <p className="recipe-meta">Categorías: {recipe.categories?.join(', ') || 'N/A'}</p>
        <p className="recipe-meta">Autor: {recipe.author?.username || 'Desconocido'}</p>
        
        {/* Nuevos campos con renderizado condicional */}
        {isPresent(recipe.prepTime) && (
          <p className="recipe-meta">Tiempo de preparación: {recipe.prepTime} mins</p>
        )}
        {isPresent(recipe.cookTime) && (
          <p className="recipe-meta">Tiempo de cocción: {recipe.cookTime} mins</p>
        )}
        {isPresent(recipe.servings) && (
          <p className="recipe-meta">Porciones: {recipe.servings}</p>
        )}
        
      </div>
        <RatingInput 
          recipeId={recipe._id}
          isLoggedIn={isLoggedIn}
          onRatingSubmitted={fetchRatings}
        />
        <button onClick={() => navigate(-1)} className="back-button">Volver a la lista de recetas</button> {/* Botón para volver */}

        <div className="pdf-export-root" aria-hidden="true">
          <div className="pdf-recipe-sheet" ref={pdfContentRef}>
            <div className="pdf-watermark">rescetario.resuacode.es</div>

            <h1 className="pdf-title">{recipe.title}</h1>
            <p className="pdf-subtitle">{recipe.description || 'Sin subtitulo'}</p>

            {recipe.basedOn && recipe.basedOn.trim() !== '' && (
              <p className="pdf-based-on">Basado en: {recipe.basedOn}</p>
            )}

            {recipe.imagesUrl && recipe.imagesUrl.length > 0 && (
              <div className="pdf-image-wrapper">
                <img
                  src={recipe.imagesUrl[0]}
                  alt={`Imagen de ${recipe.title}`}
                  className="pdf-recipe-image"
                />
              </div>
            )}

            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <section className="pdf-section">
                <h2>Ingredientes</h2>
                <ul>
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={`pdf-ingredient-${index}`}>{getIngredientLine(ingredient)}</li>
                  ))}
                </ul>
              </section>
            )}

            {isPresent(recipe.instructions) && (
              <section className="pdf-section">
                <h2>Preparacion</h2>
                <ol>
                  {recipe.instructions.map((inst, index) => (
                    <li key={`pdf-step-${index}`} dangerouslySetInnerHTML={{ __html: inst.step }}></li>
                  ))}
                </ol>
              </section>
            )}

            <section className="pdf-section pdf-meta">
              <p><strong>Categorias:</strong> {recipe.categories?.join(', ') || 'N/A'}</p>
              <p><strong>Autor:</strong> {recipe.author?.username || 'Desconocido'}</p>
              <p><strong>Tiempo de preparacion:</strong> {isPresent(recipe.prepTime) ? `${recipe.prepTime} mins` : 'N/A'}</p>
              <p><strong>Tiempo de coccion:</strong> {isPresent(recipe.cookTime) ? `${recipe.cookTime} mins` : 'N/A'}</p>
              <p><strong>Porciones:</strong> {isPresent(recipe.servings) ? recipe.servings : 'N/A'}</p>
            </section>
          </div>
        </div>
    </div>
  );
};

export default RecipeDetail;