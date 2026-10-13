/** Галерея съёмки: просмотр фото на весь экран (PhotoSwipe) в исходном порядке. */
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

const gallery = document.querySelector<HTMLElement>('[data-gallery]');

if (gallery) {
  // Слайды — в исходном порядке фото (в разметке они идут по колонкам)
  const links = [...gallery.querySelectorAll<HTMLAnchorElement>('a[data-index]')].sort(
    (a, b) => Number(a.dataset.index) - Number(b.dataset.index),
  );
  const lightbox = new PhotoSwipeLightbox({
    dataSource: links.map((a) => ({
      src: a.href,
      width: Number(a.dataset.width),
      height: Number(a.dataset.height),
      alt: a.querySelector('img')?.alt,
    })),
    pswpModule: () => import('photoswipe'),
    bgOpacity: 0.96,
    showHideAnimationType: 'fade',
    wheelToZoom: true,
  });
  lightbox.init();

  gallery.addEventListener('click', (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[data-index]');
    if (!link) return;
    event.preventDefault();
    lightbox.loadAndOpen(Number(link.dataset.index));
  });
}
