// Leaflet reads this flag at import time. Its default translate3d panes become
// separate compositing layers, which WebKit/Safari skips when rendering
// backdrop-filter, so glass panels showed the map unblurred. 2D transforms fix it.
(window as unknown as { L_DISABLE_3D: boolean }).L_DISABLE_3D = true;
