import React, { useEffect, useState } from 'react';
import Lightbox from "yet-another-react-lightbox";
import Inline from "yet-another-react-lightbox/plugins/inline";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { Photo } from '../../types/agistment';

interface AgistmentPhotosViewProps {
  photos?: Photo[];
  showThumbnails?: boolean;
  disableFullscreen?: boolean;
  className?: string;
}

export const AgistmentPhotosView: React.FC<AgistmentPhotosViewProps> = ({ 
  photos = [], 
  showThumbnails = true,
  disableFullscreen = false,
  className = ""
}) => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [slides, setSlides] = useState<any[]>([]);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (photos) {
      const images = photos.map((photo) => ({
        src: photo.link,
        title: photo.comment || undefined,
      }));
      setSlides(images);
    }
  }, [photos]);

  const toggleOpen = (state: boolean) => () => !disableFullscreen && setOpen(state);

  const updateIndex = ({ index: current }: { index: number }) => setIndex(current);

  return (
    <div className={`w-full ${className}`}>
      {slides.length > 0 ? (
        <>
          <Lightbox
            index={index}
            slides={slides}
            plugins={[Inline]}
            on={{
              view: updateIndex,
              click: disableFullscreen ? undefined : toggleOpen(true),
            }}
            inline={{
              style: {
                width: "100%",
                aspectRatio: isDesktop ? "16 / 9" : "3 / 2",
                margin: "0 auto",
                backgroundColor: "black",
              },
            }}
            styles={{
              container: { 
                backgroundColor: "transparent", 
                padding: 0,
              },
              root: { backgroundColor: "transparent" }
            }}
            carousel={{
              padding: 0,
              spacing: 0,
              imageFit: "cover",
            }}
          />

          {!disableFullscreen && (
            <Lightbox
              open={open}
              close={() => setOpen(false)}
              index={index}
              slides={slides}
              plugins={[Zoom, ...(isDesktop && showThumbnails ? [Thumbnails] : [])]}
              on={{ view: updateIndex }}
              animation={{ fade: 0 }}
              controller={{ closeOnPullDown: true, closeOnBackdropClick: true }}
              zoom={{
                maxZoomPixelRatio: 1,
                zoomInMultiplier: 2,
                doubleTapDelay: 300,
                doubleClickDelay: 300,
                keyboardMoveDistance: 50,
                wheelZoomDistanceFactor: 100,
                pinchZoomDistanceFactor: 100,
                scrollToZoom: false,
              }}
              thumbnails={isDesktop && showThumbnails ? {
                position: "bottom",
                width: 120,
                height: 80,
                border: 1,
                borderRadius: 4,
                padding: 4,
                gap: 8,
              } : undefined}
            />
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-neutral-100">
          <span className="text-neutral-400">No photos available</span>
        </div>
      )}
    </div>
  );
};
