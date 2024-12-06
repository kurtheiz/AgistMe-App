import { useEffect, useState } from 'react';
import { Image } from 'lucide-react';
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
        <div className="flex flex-row md:flex-col gap-[1px] bg-neutral-200 h-[36vh] md:h-auto">
          {/* Main large photo */}
          <div className="relative flex-grow md:aspect-[4/2]">
            <div
              className="relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity h-full bg-white"
              onClick={() => handleImageClick(0)}
            >
              <img
                src={galleryImages[0]?.src}
                alt={galleryImages[0]?.alt}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {galleryImages[0]?.title && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-sm truncate">
                  {galleryImages[0]?.title}
                </div>
              )}
            </div>
          </div>

          {/* Thumbnails - right on mobile, bottom on desktop */}
          {galleryImages.length > 1 && (
            <div className="flex flex-col md:flex-row gap-[0.15rem] md:gap-[1px] w-20 md:w-full h-full md:h-auto overflow-y-auto md:overflow-x-auto md:overflow-y-hidden">
              {galleryImages.slice(1).map((image, index) => (
                <div
                  key={image.src}
                  className="relative flex-shrink-0 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity bg-white md:w-32 h-[calc(33.4%-0.1rem)]"
                  style={{ aspectRatio: '1/1' }}
                  onClick={() => handleImageClick(index + 1)}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {image.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/50 text-white text-xs truncate">
                      {image.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="relative w-full aspect-[4/3] bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          <div className="text-neutral-500 dark:text-neutral-400 flex flex-col items-center">
            <Image className="w-12 h-12 mb-2" />
            <span className="text-sm">No photos available</span>
          </div>
        </div>
      )}
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
  );
};
