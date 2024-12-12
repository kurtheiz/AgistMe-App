import React, { useEffect, useState } from 'react';
import Lightbox from "yet-another-react-lightbox";
import Inline from "yet-another-react-lightbox/plugins/inline";
import "yet-another-react-lightbox/styles.css";
import { Photo } from '../../types/agistment';

interface AgistmentPhotosViewProps {
  photos?: Photo[];
}

export const AgistmentPhotosView: React.FC<AgistmentPhotosViewProps> = ({ photos = [] }) => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [slides, setSlides] = useState<any[]>([]);

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
            plugins={[Inline]}
            on={{
              view: updateIndex,
              click: toggleOpen(true),
            }}
            carousel={{
              padding: 0,
              spacing: 0,
              imageFit: "cover",
            }}
            inline={{
              style: {
                width: "100%",
                maxWidth: "900px",
                aspectRatio: "3 / 2",
                margin: "0 auto",
              },
            }}
          />

          <Lightbox
            open={open}
            close={toggleOpen(false)}
            index={index}
            slides={slides}
            on={{ view: updateIndex }}
            animation={{ fade: 0 }}
            controller={{ closeOnPullDown: true, closeOnBackdropClick: true }}
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
