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
}

export const AgistmentPhotosView: React.FC<AgistmentPhotosViewProps> = ({ photos = [] }) => {
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

  const toggleOpen = (state: boolean) => () => setOpen(state);

  const updateIndex = ({ index: current }: { index: number }) => setIndex(current);

  return (
    <div className="w-full">
      {slides.length > 0 ? (
        <>
          <Lightbox
            index={index}
            slides={slides}
            plugins={[Inline, ...(isDesktop ? [Thumbnails] : [])]}
            on={{
              view: updateIndex,
              click: toggleOpen(true),
            }}
            inline={{
              style: {
                width: "100%",
                aspectRatio: isDesktop ? "16 / 9" : "3 / 2",
                margin: "0 auto",
                backgroundColor: "black",
              },
            }}
            thumbnails={isDesktop ? {
              position: "end",
              width: 120,
              height: 80,
              border: 1,
              borderRadius: 4,
              padding: 4,
              gap: 8,
            } : undefined}
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

          <Lightbox
            open={open}
            close={() => setOpen(false)}
            index={index}
            slides={slides}
            plugins={[Zoom, ...(isDesktop ? [Thumbnails] : [])]}
            on={{ view: updateIndex }}
            animation={{ fade: 0 }}
            controller={{ closeOnPullDown: true, closeOnBackdropClick: true }}
            zoom={{
              maxZoomPixelRatio: 1,
              zoomInMultiplier: 2,
              doubleTapDelay: 300,
              doubleClickDelay: 300,
              doubleClickMaxStops: 2,
              keyboardMoveDistance: 50,
              wheelZoomDistanceFactor: 100,
              pinchZoomDistanceFactor: 100,
              scrollToZoom: true
            }}
            carousel={{
              padding: 0,
              spacing: 0,
              imageFit: "cover",
            }}
            thumbnails={isDesktop ? {
              position: "end",
              width: 120,
              height: 80,
              border: 1,
              borderRadius: 4,
              padding: 4,
              gap: 8,
            } : undefined}
            inline={{
              style: {
                width: "100%",
                height: "300px",
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
          />
        </>
      ) : (
        <div className="w-full aspect-[3/2] bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">No photos available</p>
        </div>
      )}
    </div>
  );
};
