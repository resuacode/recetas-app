// frontend/src/components/RecipeForm.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Componente auxiliar para un campo de texto con negrita/cursiva
const RichTextarea = ({ value, onChange, placeholder, rows = 3 }) => {
    // Estado interno para el contenido, puede ser HTML o texto plano
    const [internalValue, setInternalValue] = useState(value);

    useEffect(() => {
        setInternalValue(value); // Sincroniza si la prop value cambia (para edición)
    }, [value]);

    const handleInput = (e) => {
        setInternalValue(e.target.value);
        onChange(e.target.value); // Pasa el valor al padre
    };

    const applyFormat = (tag) => {
        const textarea = document.getElementById(placeholder); // Obtener el textarea por ID
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = internalValue.substring(start, end);

        let newText = internalValue;
        if (selectedText) {
            newText = internalValue.substring(0, start) +
                      `<${tag}>${selectedText}</${tag}>` +
                      internalValue.substring(end);
        } else {
            newText = internalValue + `<${tag}></${tag}>`;
        }

        setInternalValue(newText);
        onChange(newText); // Pasa el nuevo valor al padre

        // Opcional: Re-enfocar y posicionar el cursor
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + tag.length + 2, end + tag.length + 2);
        }, 0);
    };

    return (
        <div className="rich-textarea-container">
            <textarea
                id={placeholder} // Añadir ID para referencia
                placeholder={placeholder}
                value={internalValue}
                onChange={handleInput}
                rows={rows}
            />
            <div className="formatting-buttons">
                <button type="button" onClick={() => applyFormat('b')}><b>B</b></button>
                <button type="button" onClick={() => applyFormat('i')}><i>I</i></button>
                {/* Añadir más botones de formato si se desea */}
            </div>
        </div>
    );
};


const RecipeForm = ({ type = 'create' }) => { // Ya no necesitamos initialData como prop
  const navigate = useNavigate();
  const { id } = useParams(); // Obtiene el ID si estamos en modo edición
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imagesUrl: [],
    videoUrl: '',
    categories: [''],
    ingredients: [{ name: '', quantity: '', unit: '' }],
    instructions: [{ step: '' }],
    prepTime: '',
    cookTime: '',
    servings: '',
    basedOn: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState(null); // Quizás estaría bien renombrarlo a globalError o algo así
  const [loadingForm, setLoadingForm] = useState(true); // Nuevo estado para la carga inicial del formulario
  const [saving, setSaving] = useState(false); // Estado para el proceso de guardar
  const [uploadingImage, setUploadingImage] = useState(false); 

  const fetchRecipe = useCallback(async () => {
    setLoadingForm(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API_URL}/recipes/${id}`, config);
      const recipeData = response.data;

      // Mapear los datos de la receta para el estado del formulario
      setFormData({
        title: recipeData.title || '',
        description: recipeData.description || '',
        imagesUrl: recipeData.imagesUrl?.length > 0 ? recipeData.imagesUrl : [],
        videoUrl: recipeData.videoUrl || '',
        categories: recipeData.categories?.length > 0 ? recipeData.categories : [''],
        ingredients: recipeData.ingredients?.length > 0 ? recipeData.ingredients : [{ name: '', quantity: '', unit: '' }],
        // Asegurarse de que instructions tenga la propiedad 'step'
        instructions: recipeData.instructions?.length > 0 ? recipeData.instructions.map(inst => ({ step: inst.step || '' })) : [{ step: '' }],
        prepTime: recipeData.prepTime || '',
        cookTime: recipeData.cookTime || '',
        servings: recipeData.servings || '',
        basedOn: recipeData.basedOn || '',
      });
    } catch (err) {
      console.error('Error al cargar la receta para editar:', err);
      toast.error('No se pudo cargar la receta para editar. Asegúrate de que existe o inténtalo más tarde.');
      setError('No se pudo cargar la receta para editar. Asegúrate de que existe o inténtalo más tarde.');
      // Si hay un error, redirigir a la página de gestión
      navigate('/manage-recipes');
    } finally {
      setLoadingForm(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (type === 'edit' && id) {
      fetchRecipe();
    } else {
      // Si es 'create', reinicia el formulario
      setFormData({
        title: '',
        description: '',
        imagesUrl: [],
        videoUrl: '',
        categories: [''],
        ingredients: [{ name: '', quantity: '', unit: '' }],
        instructions: [{ step: '' }],
        prepTime: '',
        cookTime: '',
        servings: '',
        basedOn: '',
      });
      setLoadingForm(false); // No necesitamos cargar si es creación
    }
  }, [type, id, fetchRecipe]); // Dependencias para re-ejecutar el efecto

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // --- Manejo de Arrays Dinámicos ---


    // La función handleImageChange ya no es para inputs de URL, sino para la URL de Cloudinary
    // Se elimina el addImageField y removeImageField para inputs de URL.
    // Ahora, `imagesUrl` se gestionará completamente por la subida de archivos.
    // Si quieres múltiples imágenes, tendrías que permitir múltiples subidas o una para cada campo.
    // Para simplificar, vamos a permitir que el usuario suba UNA imagen por el momento.
    // Si necesitas múltiples imágenes, la lógica de `handleImageUpload` necesitaría ajustarse.
   

   // Función para manejar la subida de la imagen a Cloudinary
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        setFormErrors(prev => ({ ...prev, imageFile: undefined })); // Limpiar error previo

        if (!file) {
            // No file selected, could show a message if desired
            return;
        }

        // Validación de tipo de archivo
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
        if (!validImageTypes.includes(file.type)) {
            toast.error('Formato de imagen no válido. Por favor, usa JPG, PNG, GIF, WebP, HEIC, o HEIF.');
            setFormErrors(prev => ({ ...prev, imageFile: 'Formato de imagen no válido. (JPG, PNG, GIF, WebP, HEIC, HEIF)' }));
            return;
        }

        // Validación de tamaño de archivo (ej. máximo 5MB)
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
        if (file.size > MAX_FILE_SIZE) {
            toast.error('La imagen es demasiado grande. Tamaño máximo: 5MB.');
            setFormErrors(prev => ({ ...prev, imageFile: 'La imagen es demasiado grande. (Máx. 5MB)' }));
            return;
        }

        setUploadingImage(true);
        const formDataCloudinary = new FormData();
        formDataCloudinary.append('file', file);
        formDataCloudinary.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        // formDataCloudinary.append('cloud_name', CLOUDINARY_CLOUD_NAME); // No es estrictamente necesario aquí si ya está en la URL

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formDataCloudinary,
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error de Cloudinary:', errorData);
                toast.error(`Error al subir la imagen: ${errorData.error?.message || 'Problema con Cloudinary.'}`);
                setFormErrors(prev => ({ ...prev, imageFile: errorData.error?.message || 'Error desconocido al subir imagen.' }));
                return;
            }

            const data = await response.json();
            // Actualiza el estado imagesUrl con la nueva URL (reemplaza la existente si es edición, o añade si es nueva)
            // Asumimos que solo queremos una imagen principal por receta.
            // Si quieres múltiples imágenes, deberías cambiar la lógica aquí
            // para añadir la nueva URL a `formData.imagesUrl`.
            setFormData(prev => ({ ...prev, imagesUrl: [data.secure_url] })); // Reemplaza la primera imagen
            toast.success('Imagen subida!');
        } catch (error) {
            console.error('Error al subir la imagen:', error);
            toast.error('Error de red o desconocido al subir la imagen. Inténtalo de nuevo.');
            setFormErrors(prev => ({ ...prev, imageFile: 'Error de red o desconocido al subir la imagen.' }));
        } finally {
            setUploadingImage(false);
            // Limpia el input de archivo para permitir otra selección si es necesario
            e.target.value = '';
        }
    };

    // Función para eliminar una imagen previamente subida (mostrada en la previsualización)
    const removeUploadedImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            imagesUrl: prev.imagesUrl.filter((_, index) => index !== indexToRemove)
        }));
    };

  // Categorías
  const handleCategoryChange = (index, value) => {
    const newCategories = [...formData.categories];
    newCategories[index] = value;
    setFormData({ ...formData, categories: newCategories });
  };
  const addCategoryField = () => setFormData({ ...formData, categories: [...formData.categories, ''] });
  const removeCategoryField = (index) => {
    const newCategories = formData.categories.filter((_, i) => i !== index);
    setFormData({ ...formData, categories: newCategories.length > 0 ? newCategories : [''] }); // Asegura al menos un campo
  };

  // Ingredientes
  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData({ ...formData, ingredients: newIngredients });
  };
  const addIngredientField = () => setFormData({ ...formData, ingredients: [...formData.ingredients, { name: '', quantity: '', unit: '' }] });
  const removeIngredientField = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: newIngredients.length > 0 ? newIngredients : [{ name: '', quantity: '', unit: '' }] });
  };

  // Instrucciones (Pasos)
  const handleInstructionChange = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = { step: value };
    setFormData({ ...formData, instructions: newInstructions });
  };
  const addInstructionField = () => setFormData({ ...formData, instructions: [...formData.instructions, { step: '' }] });
  const removeInstructionField = (index) => {
    const newInstructions = formData.instructions.filter((_, i) => i !== index);
    setFormData({ ...formData, instructions: newInstructions.length > 0 ? newInstructions : [{ step: '' }] });
  };

  // --- Envío del Formulario ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Limpiar errores previos globales
    setFormErrors({}); // Limpiar errores previos
    setSaving(true); 

    const newErrors = {}; // Objeto para acumular los errores

    // Validaciones en el frontend (básicas)
    if (!formData.title.trim() || !formData.description.trim()) {
        newErrors.title = 'El título y la descripción son obligatorios.';
    }
    
    if (!formData.description.trim()) {
            newErrors.description = 'La descripción es obligatoria.';
        }

    // Validar al menos una categoría válida
    const validCategories = formData.categories.filter(cat => cat.trim() !== '');
    if (validCategories.length === 0) {
        newErrors.categories = 'Debes añadir al menos una categoría válida.';
    }

    // Validar al menos un ingrediente completo y válido
    const validIngredients = formData.ingredients.filter(ing =>
        ing.name.trim() && ing.quantity > 0 && ing.unit.trim()
    );
    if (validIngredients.length === 0) {
        newErrors.ingredients = 'Debes añadir al menos un ingrediente con nombre, cantidad (mayor que 0) y unidad.';
    } else {
        // Validar que si hay ingredientes, sus campos numéricos sean válidos
        formData.ingredients.forEach((ing, index) => {
            if (ing.name.trim() || ing.quantity || ing.unit.trim()) { // Si el ingrediente no está totalmente vacío
                if (!ing.name.trim()) newErrors[`ingredientName-${index}`] = 'El nombre del ingrediente es obligatorio.';
                if (ing.quantity === '' || isNaN(ing.quantity) || ing.quantity <= 0) newErrors[`ingredientQuantity-${index}`] = 'La cantidad debe ser un número positivo.';
                if (!ing.unit.trim()) newErrors[`ingredientUnit-${index}`] = 'La unidad es obligatoria.';
            }
        });
    }


    // Validar al menos un paso de instrucción válido
    const validInstructions = formData.instructions.filter(inst => inst.step.trim() !== '');
    if (validInstructions.length === 0) {
        newErrors.instructions = 'Debes añadir al menos un paso de instrucción válido.';
    } else {
        // Validar que si hay instrucciones, no estén vacías
        formData.instructions.forEach((inst, index) => {
            if (!inst.step.trim()) {
                newErrors[`instructionStep-${index}`] = `El paso ${index + 1} no puede estar vacío.`;
            }
        });
    }

    // Validaciones para tiempos y raciones (números positivos opcionales)
    if (formData.prepTime !== '' && (isNaN(formData.prepTime) || parseInt(formData.prepTime, 10) < 0)) {
        newErrors.prepTime = 'El tiempo de preparación debe ser un número positivo.';
    }
    if (formData.cookTime !== '' && (isNaN(formData.cookTime) || parseInt(formData.cookTime, 10) < 0)) {
        newErrors.cookTime = 'El tiempo de cocción debe ser un número positivo.';
    }
    if (formData.servings !== '' && (isNaN(formData.servings) || parseInt(formData.servings, 10) < 1)) {
        newErrors.servings = 'El número de raciones debe ser un número positivo (al menos 1).';
    }

    // Opcional si queremos imagen obligatoria: validación: Asegurarse de que al menos una imagen ha sido subida
    /*
    if (formData.imagesUrl.length === 0) {
        newErrors.imagesUrl = 'Debes subir al menos una imagen para la receta.';
    }
        */

    // Validar formato URL (para imagesUrl y videoUrl)
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/; 

    if (formData.videoUrl.trim() !== '' && !urlRegex.test(formData.videoUrl.trim())) {
        newErrors.videoUrl = 'La URL del video no es válida.';
    }

    // Si hay errores, actualiza el estado de errores y detiene el envío
    if (Object.keys(newErrors).length > 0) {
        setFormErrors(newErrors);
        toast.error('Por favor, corrige los errores en el formulario.'); // Un toast general de advertencia
        setSaving(false);
        return;
    }

    // Limpiar datos antes de enviar al backend
    const dataToSend = {
      ...formData,
      // Filtrar enlaces de imágenes y categorías vacíos
      imagesUrl: formData.imagesUrl.filter(url => url.trim() !== ''),
      categories: formData.categories.filter(cat => cat.trim() !== ''),
      // Filtrar ingredientes y pasos vacíos
      ingredients: formData.ingredients.filter(ing => ing.name.trim() && ing.quantity && ing.unit.trim()),
      instructions: formData.instructions.filter(inst => inst.step.trim()).map((inst, index) => ({
        step: inst.step,
        order: index + 1 // Asignar el orden automáticamente
      })),
      // Convertir números a null si están vacíos o no son válidos
      prepTime: formData.prepTime === '' ? null : parseInt(formData.prepTime, 10),
      cookTime: formData.cookTime === '' ? null : parseInt(formData.cookTime, 10),
      servings: formData.servings === '' ? null : parseInt(formData.servings, 10),
      // Convertir basedOn y videoUrl a null si están vacíos
      basedOn: formData.basedOn.trim() === '' ? null : formData.basedOn.trim(),
      videoUrl: formData.videoUrl.trim() === '' ? null : formData.videoUrl.trim(),
    };

    // Eliminar propiedades con valor null si el backend prefiere que no existan
    for (const key in dataToSend) {
        if (dataToSend[key] === null || (Array.isArray(dataToSend[key]) && dataToSend[key].length === 0)) {
            delete dataToSend[key];
        }
    }

    // Ajuste para el videoUrl - Si es TikTok/Instagram, es posible que necesitemos el embed
    if (dataToSend.videoUrl) {
        // Ejemplo básico, podrías necesitar una lógica más compleja
        if (dataToSend.videoUrl.includes('tiktok.com') && !dataToSend.videoUrl.includes('/embed/')) {
            // Heurística simple, mejora según la API de TikTok
            // Podrías necesitar un backend para obtener el embed o usar una API
            // For now, let's just use the direct URL, it might not embed
        }
        if (dataToSend.videoUrl.includes('instagram.com') && !dataToSend.videoUrl.includes('/embed/')) {
            // Igual que con TikTok
        }
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      let response;
      if (type === 'create') {
        response = await axios.post(`${API_URL}/recipes`, dataToSend, config);
        toast.success('Receta creada exitosamente!');
      } else { // 'edit'
        response = await axios.put(`${API_URL}/recipes/${id}`, dataToSend, config);
        toast.success('Receta actualizada exitosamente!');
      }
      // console.log('Respuesta del servidor:', response.data);
      navigate('/manage-recipes'); // Redirigir a la gestión de recetas
    } catch (err) {
      console.error('Error al guardar la receta:', err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || 'Error al guardar la receta. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

    // Muestra un mensaje de carga inicial si estamos en modo edición
  if (loadingForm && type === 'edit') return <p className="loading-message">Cargando receta para editar...</p>;

  // Muestra un mensaje de error si la carga inicial falló
  if (error && type === 'edit') return (
    <div className="error-container">
      <p className="error-message">{error}</p>
      <button onClick={() => navigate('/manage-recipes')} className="back-button">Volver a la gestión de recetas</button>
    </div>
    );

  return (
    <div className="recipe-form-container">
      <h2>{type === 'create' ? 'Crear Nueva Receta' : 'Editar Receta'}</h2>
      {error && <p className="error-message">{error}</p>} {/* Muestra errores de envío */}
      {formErrors.general && <p className="error-message">{formErrors.general}</p>} {/* Si quieres un error general al inicio */}


      <form onSubmit={handleSubmit}>
        {/* Título */}
        <div className="form-group">
          <label htmlFor="title">Título de la Receta *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ej: Tortilla de Patatas"
            className={formErrors.title ? 'error' : ''} 
            // required // lo manejamos con validación personalizada
          />
          {formErrors.title && <p className="error-input-message">{formErrors.title}</p>}
        </div>

        {/* Descripción */}
        <div className="form-group">
          <label htmlFor="description">Descripción Breve *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Ej: Una deliciosa y jugosa tortilla..."
            rows="3"
            className={formErrors.description ? 'error' : ''}
            // required // lo manejamos con validación personalizada
          />
          {formErrors.description && <p className="error-input-message">{formErrors.description}</p>}
        </div>

         {/* Campo de subida de Imagen a Cloudinary */}
         <div className="form-group">
            <label htmlFor="recipeImage">Imagen de la Receta</label>
            <input
                type="file"
                id="recipeImage"
                accept="image/jpeg, image/png, image/gif, image/webp, image/heic, image/heif" // Acepta estos tipos de archivo
                onChange={handleImageUpload}
                disabled={uploadingImage} // Deshabilita el input mientras se sube
                // className={formErrors.imageFile ? 'error' : ''}
                className="hidden-file-input" // Clase para ocultar el input real
                ref={fileInputRef} // Asocia la ref
            />

            {/* Botón personalizado para disparar la selección de archivo */}
            <label htmlFor="recipeImage" className="custom-file-upload-button" disabled={uploadingImage}>
                {uploadingImage ? 'Subiendo...' : 'Seleccionar Imagen'}
            </label>

            {uploadingImage && <p className="uploading-message">Subiendo imagen...</p>}
            {formErrors.imageFile && <p className="error-input-message">{formErrors.imageFile}</p>}

            {/* Previsualización de imágenes subidas */}
            {formData.imagesUrl && formData.imagesUrl.length > 0 && (
                <div className="uploaded-images-preview">
                    <p>Imagen actual:</p>
                    {formData.imagesUrl.map((url, index) => (
                        <div key={index} className="uploaded-image-item">
                            <img src={url} alt={`Imagen ${index + 1}`} />
                            <button type="button" onClick={() => removeUploadedImage(index)} className="remove-image-button">Eliminar</button>
                        </div>
                    ))}
                </div>
            )}
            {formErrors.imagesUrl && <p className="error-input-message">{formErrors.imagesUrl}</p>}
        </div>

        {/* Video URL */}
        <div className="form-group">
          <label htmlFor="videoUrl">Enlace de Vídeo (TikTok/Instagram)</label>
          <input
            type="url"
            id="videoUrl"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleChange}
            className={formErrors.videoUrl ? 'error' : ''}
            placeholder="Ej: https://www.tiktok.com/@user/video/..."
          />
        {formErrors.videoUrl && <p className="error-input-message">{formErrors.videoUrl}</p>} 
        </div>

        {/* Categorías */}
        <div className="form-group dynamic-fields-group">
          <label>Categorías *</label>
          {formData.categories.map((cat, index) => (
            <div key={index} className="dynamic-field-item">
              <input
                type="text"
                value={cat}
                onChange={(e) => handleCategoryChange(index, e.target.value)}
                placeholder={`Categoría ${index + 1}`}
                className={formErrors[`category-${index}`] ? 'error' : ''}
              />
              {formData.categories.length > 1 && ( // Permite eliminar si hay más de una
                <button type="button" onClick={() => removeCategoryField(index)} className="remove-field-button">X</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addCategoryField} className="add-field-button">Añadir más categorías</button>
        {formErrors.categories && <p className="error-input-message">{formErrors.categories}</p>} 
        </div>

        {/* Ingredientes */}
        <div className="form-group dynamic-fields-group">
          <label>Ingredientes *</label>
          {formData.ingredients.map((ing, index) => (
            <div key={index} className="dynamic-field-item ingredient-item">
              <input
                type="text"
                value={ing.name}
                onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                placeholder="Nombre (Ej: Patatas)"
                // required={index === 0} // Primer ingrediente obligatorio
                className={formErrors[`ingredientName-${index}`] ? 'error' : ''}
              />
            {formErrors[`ingredientName-${index}`] && <p className="error-input-message">{formErrors[`ingredientName-${index}`]}</p>}
              <input
                type="number"
                value={ing.quantity}
                onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                placeholder="Cantidad (Ej: 500)"
                // required={index === 0}
                min="0"
                className={formErrors[`ingredientQuantity-${index}`] ? 'error' : ''}
              />
            {formErrors[`ingredientQuantity-${index}`] && <p className="error-input-message">{formErrors[`ingredientQuantity-${index}`]}</p>}
              <input
                type="text"
                value={ing.unit}
                onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                placeholder="Unidad (Ej: gramos)"
                // required={index === 0}
                className={formErrors[`ingredientUnit-${index}`] ? 'error' : ''}
              />
            {formErrors[`ingredientUnit-${index}`] && <p className="error-input-message">{formErrors[`ingredientUnit-${index}`]}</p>}
              {formData.ingredients.length > 1 && (
                <button type="button" onClick={() => removeIngredientField(index)} className="remove-field-button">X</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addIngredientField} className="add-field-button">Añadir más ingredientes</button>
        {formErrors.ingredients && <p className="error-input-message">{formErrors.ingredients}</p>} 
        </div>

        {/* Instrucciones (Pasos) */}
        <div className="form-group dynamic-fields-group">
          <label>Instrucciones (Paso a Paso) *</label>
          {formData.instructions.map((inst, index) => (
            <div key={index} className="dynamic-field-item instruction-item">
              <span className="step-number">{index + 1}.</span>
              <RichTextarea
                value={inst.step}
                onChange={(value) => handleInstructionChange(index, value)}
                placeholder={`Paso ${index + 1}`}
                rows={3}
                className={formErrors[`instructionStep-${index}`] ? 'error' : ''} // Añadir clase de error si hay formErrors
              />
              {formData.instructions.length > 1 && (
                <button type="button" onClick={() => removeInstructionField(index)} className="remove-field-button">X</button>
              )}
            {formErrors[`instructionStep-${index}`] && <p className="error-input-message">{formErrors[`instructionStep-${index}`]}</p>}
            </div>
          ))}
          <button type="button" onClick={addInstructionField} className="add-field-button">Añadir más pasos</button>
        {formErrors.instructions && <p className="error-input-message">{formErrors.instructions}</p>}
        </div>

        {/* Campos Numéricos y BasedOn */}
        <div className="form-group optional-fields-group">
            <h3>Detalles Opcionales</h3>
            <div className="optional-fields-grid">
                <div className="form-group-inline">
                    <label htmlFor="prepTime">Tiempo de Preparación (minutos)</label>
                    <input
                        type="number"
                        id="prepTime"
                        name="prepTime"
                        value={formData.prepTime}
                        onChange={handleChange}
                        placeholder="Ej: 30"
                        min="0"
                        className={formErrors.prepTime ? 'error' : ''} // Añadir clase de error si hay formErrors
                    />
                {formErrors.prepTime && <p className="error-input-message">{formErrors.prepTime}</p>} 
                </div>
                <div className="form-group-inline">
                    <label htmlFor="cookTime">Tiempo de Cocción (minutos)</label>
                    <input
                        type="number"
                        id="cookTime"
                        name="cookTime"
                        value={formData.cookTime}
                        onChange={handleChange}
                        placeholder="Ej: 20"
                        min="0"
                        className={formErrors.cookTime ? 'error' : ''} // Añadir clase de error si hay formErrors
                    />
                {formErrors.cookTime && <p className="error-input-message">{formErrors.cookTime}</p>}
                </div>
                <div className="form-group-inline">
                    <label htmlFor="servings">Número de Raciones</label>
                    <input
                        type="number"
                        id="servings"
                        name="servings"
                        value={formData.servings}
                        onChange={handleChange}
                        placeholder="Ej: 4"
                        min="1"
                        className={formErrors.servings ? 'error' : ''} // Añadir clase de error si hay formErrors
                    />
                {formErrors.servings && <p className="error-input-message">{formErrors.servings}</p>} 
                </div>
            </div>
            <div className="form-group">
                <label htmlFor="basedOn">Basado en</label>
                <input
                    type="text"
                    id="basedOn"
                    name="basedOn"
                    value={formData.basedOn}
                    onChange={handleChange}
                    placeholder="Ej: Receta de @Diegodoal"
                />
            </div>
        </div>

        <button type="submit" className="submit-recipe-button" disabled={saving}>
          {saving ? 'Guardando...' : (type === 'create' ? 'Crear Receta' : 'Actualizar Receta')}
        </button>
      </form>
    </div>
  );
};

export default RecipeForm;