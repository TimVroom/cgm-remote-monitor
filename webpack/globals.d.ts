import * as lodash from 'lodash';

declare global {
  interface Window {
    "_": lodash;
  }
}