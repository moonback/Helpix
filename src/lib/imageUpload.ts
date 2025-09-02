import { supabase } from './supabase';

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Upload une image vers Supabase Storage
 */
export const uploadImage = async (file: File, bucket: string = 'images'): Promise<UploadResult> => {
  try {
    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `items/${fileName}`;

    // Upload du fichier
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Récupérer l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath
    };
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'image:', error);
    throw error;
  }
};

/**
 * Upload plusieurs images
 */
export const uploadImages = async (files: File[], bucket: string = 'images'): Promise<UploadResult[]> => {
  const uploadPromises = files.map(file => uploadImage(file, bucket));
  return Promise.all(uploadPromises);
};

/**
 * Supprimer une image de Supabase Storage
 */
export const deleteImage = async (path: string, bucket: string = 'images'): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error);
    throw error;
  }
};

/**
 * Supprimer plusieurs images
 */
export const deleteImages = async (paths: string[], bucket: string = 'images'): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Erreur lors de la suppression des images:', error);
    throw error;
  }
};
