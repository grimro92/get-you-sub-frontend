import { createApp } from 'vue';
import App from './App.vue';

// Vuetify をインポート
import 'vuetify/styles'; // Vuetify のスタイルシート
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css'; // マテリアルデザインアイコン（アイコン表示用）

const vuetify = createVuetify({
  components,
  directives,
  // 必要に応じてテーマやアイコンを設定
  icons: {
    defaultSet: 'mdi',
  },
});

createApp(App)
  .use(vuetify) // Vuetify をVueアプリに登録
  .mount('#app');
