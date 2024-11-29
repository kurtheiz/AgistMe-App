import { useEffect, useState } from 'react';
import { PhotoIcon } from '../Icons';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { Photo } from '../../types/agistment';

interface Props {
  photos?: Photo[];
}

export const AgistmentPhotosView = ({ photos = [] }: Props) => {
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (photos) {
      const images = photos.map(photo => ({
        src: photo.link,
        alt: photo.comment || '',
        title: photo.comment || '',
        thumbnails: [{
          src: photo.link,
          alt: photo.comment || '',
          width: 120,
          height: 80
        }]
      }));
      setGalleryImages(images);
    }
  }, [photos]);

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <div className="w-full">
      {galleryImages.length > 0 ? (
        <div className="relative">
          <div className="grid grid-cols-4 gap-1 aspect-[16/9]">
            {/* Main large photo */}
            <div
              className="col-span-3 relative overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => handleImageClick(0)}
            >
              <img
                src={galleryImages[0]?.src}
                alt={galleryImages[0]?.alt}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            
            {/* Right side photos */}
            <div className="flex flex-col gap-1">
              {galleryImages.slice(1, 3).map((image, index) => (
                <div
                  key={image.src}
                  className="relative h-1/2 overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleImageClick(index + 1)}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {index === 1 && galleryImages.length > 3 && (
                    <div 
                      className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLightboxOpen(true);
                      }}
                    >
                      +{galleryImages.length - 3} more
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <Lightbox
            open={isLightboxOpen}
            close={() => setIsLightboxOpen(false)}
            index={currentImageIndex}
            slides={galleryImages}
            plugins={[Thumbnails, Captions]}
            thumbnails={{
              position: "bottom",
              width: 120,
              height: 80,
              border: 2,
              borderRadius: 4,
              padding: 4,
              gap: 8,
              showToggle: false
            }}
            captions={{
              descriptionTextAlign: "center",
              showToggle: false
            }}
            styles={{
              captionsTitle: { 
                textAlign: "center",
                fontSize: "1rem",
                padding: "0.5rem"
              }
            }}
            carousel={{
              finite: false,
              preload: 3
            }}
            noScroll={{ disabled: true }}
          />
        </div>
      ) : (
        <div className="relative w-full aspect-[16/9] bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          <div className="text-neutral-500 dark:text-neutral-400 flex flex-col items-center">
            <PhotoIcon className="w-12 h-12 mb-2" />
            <span className="text-sm">No photos available</span>
          </div>
        </div>
      )}
    </div>
  );
};
