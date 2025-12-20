'use client';
import { useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadMultipleImages, addUploadedImage, removeUploadedImage } from '@/redux/slice/ProductSlice';
import { Image, X, UploadCloud } from 'lucide-react';


export default function ImageUpload({ 
  onImagesChange, 
  multiple = true, 
  maxImages = 10,
  currentImages = [],
  uploadType = 'product-images'
}) {
  const dispatch = useDispatch();
  const { uploadedImages, loading } = useSelector(state => state.product);
  const [localImages, setLocalImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const fileInputRef = useRef(null);

  // Combine current images with newly uploaded ones
  const allImages = [...currentImages, ...uploadedImages, ...previewImages];

  const handleFileSelect = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const totalImages = allImages.length + newFiles.length;
    
    if (totalImages > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Create local previews
    const newPreviews = [];
    for (const file of newFiles) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert(`File ${file.name} is too large. Maximum size is 5MB.`);
        continue;
      }

      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image.`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push({
          file,
          preview: e.target.result,
          id: Math.random().toString(36).substr(2, 9),
          name: file.name
        });
        
        if (newPreviews.length === newFiles.filter(f => f.type.startsWith('image/')).length) {
          setPreviewImages(prev => [...prev, ...newPreviews]);
          uploadImages(newPreviews.map(p => p.file));
        }
      };
      reader.readAsDataURL(file);
    }
  }, [allImages, maxImages]);

  const uploadImages = useCallback(async (files) => {
    try {
      await dispatch(uploadMultipleImages({ files, uploadType }));
      if (onImagesChange) {
        onImagesChange([...uploadedImages, ...previewImages]);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    }
  }, [dispatch, uploadType, onImagesChange, uploadedImages, previewImages]);

  const removeImage = useCallback((index, isPreview = false) => {
    if (isPreview) {
      setPreviewImages(prev => prev.filter((_, i) => i !== index));
    } else if (index < currentImages.length) {
      // Remove from current images (parent component handles this)
      if (onImagesChange) {
        const newImages = currentImages.filter((_, i) => i !== index);
        onImagesChange(newImages);
      }
    } else if (index < currentImages.length + uploadedImages.length) {
      // Remove from uploaded images
      const uploadIndex = index - currentImages.length;
      dispatch(removeUploadedImage(uploadIndex));
      if (onImagesChange) {
        onImagesChange(uploadedImages.filter((_, i) => i !== uploadIndex));
      }
    } else {
      // Remove from preview images
      const previewIndex = index - currentImages.length - uploadedImages.length;
      setPreviewImages(prev => prev.filter((_, i) => i !== previewIndex));
    }
  }, [currentImages, uploadedImages, dispatch, onImagesChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Image Preview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Current Images */}
        {currentImages.map((image, index) => (
          <div key={`current-${index}`} className="relative group">
            <img
              src={image.url || image}
              alt={`Product image ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {/* Uploaded Images */}
        {uploadedImages.map((image, index) => (
          <div key={`uploaded-${index}`} className="relative group">
            <img
              src={image.url}
              alt={`Uploaded image ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={() => removeImage(currentImages.length + index)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {/* Preview Images (being uploaded) */}
        {previewImages.map((image, index) => (
          <div key={`preview-${index}`} className="relative group">
            <img
              src={image.preview}
              alt={`Preview ${image.name}`}
              className="w-full h-32 object-cover rounded-lg border"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="text-white text-sm">Uploading...</div>
            </div>
            <button
              type="button"
              onClick={() => removeImage(currentImages.length + uploadedImages.length + index, true)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          loading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={triggerFileInput}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={loading}
        />
        
        {loading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-blue-600">Uploading images...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium">
              {multiple ? 'Drag & drop images here' : 'Drag & drop image here'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, GIF, WebP up to 5MB each
            </p>
            {multiple && (
              <p className="text-xs text-gray-400">
                Maximum {maxImages} images total
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}