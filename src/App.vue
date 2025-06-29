<template>
  <!-- v-app は Vuetify アプリケーションのルートコンポーネントです -->
  <v-app>
    <!-- v-main はアプリケーションのメインコンテンツ領域を定義します -->
    <v-main class="d-flex align-center justify-center bg-grey-lighten-3">
      <!-- v-container はコンテンツの幅を制限し、中央に配置します -->
      <v-container class="pa-4 pa-sm-6 pa-md-8" fluid>
        <!-- v-responsive でアスペクト比を保ちつつ最大幅を設定 -->
        <v-responsive max-width="800" class="mx-auto">
          <!-- v-card でアプリケーションのメインコンテナを作成 -->
          <v-card class="pa-6 pa-sm-8 rounded-xl elevation-10" color="white">
            <!-- ヘッダーセクション -->
            <v-card-title class="text-h4 text-sm-h3 text-center font-weight-bold text-blue-darken-3 mb-4">
              📚 多辞書検索履歴アプリ
            </v-card-title>
            <v-card-subtitle class="text-subtitle-1 text-sm-h6 text-center text-medium-emphasis mb-6">
              調べた単語を複数の辞書サイトで検索し、履歴として保存します。
            </v-card-subtitle>

            <!-- 検索セクション -->
            <v-card-text>
              <v-row no-gutters class="align-center justify-center">
                <v-col cols="12" md="8" class="pr-md-2 mb-4 mb-md-0">
                  <v-text-field v-model="searchQuery" @keyup.enter="searchWord" label="単語を入力してください" variant="outlined"
                    density="comfortable" clearable hide-details :loading="loading" :disabled="loading"
                    class="rounded-lg"></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-btn @click="searchWord" :disabled="loading" :loading="loading" color="green-darken-2" size="large"
                    block class="rounded-lg elevation-5">
                    <v-icon left>mdi-magnify</v-icon>
                    {{ loading ? '検索中...' : '検索＆保存' }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>

            <!-- エラーメッセージ -->
            <v-card-text v-if="errorMessage" class="pt-0 pb-4">
              <v-alert type="error" icon="mdi-alert-circle" variant="tonal" class="rounded-lg">
                {{ errorMessage }}
              </v-alert>
            </v-card-text>

            <!-- 結果セクション -->
            <v-expand-transition>
              <v-card-text v-if="weblioUrl" class="pt-0 pb-4">
                <v-card class="pa-4 rounded-lg elevation-2 bg-grey-lighten-4">
                  <v-card-title class="text-h6 font-weight-bold text-center text-blue-grey-darken-2">
                    🔍 生成された辞書URL
                  </v-card-title>
                  <v-list dense class="bg-transparent">
                    <v-list-item class="mb-2 rounded-lg elevation-1" color="blue-lighten-5">
                      <v-list-item-content>
                        <v-list-item-title class="font-weight-medium text-purple-darken-2">WeBliO:</v-list-item-title>
                        <v-list-item-subtitle>
                          <a :href="weblioUrl" target="_blank" rel="noopener noreferrer"
                            class="text-decoration-none text-blue-darken-1 url-link-text">
                            {{ weblioUrl }}
                            <v-icon size="small">mdi-open-in-new</v-icon>
                          </a>
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>

                    <v-list-item class="mb-2 rounded-lg elevation-1" color="blue-lighten-5">
                      <v-list-item-content>
                        <v-list-item-title class="font-weight-medium text-purple-darken-2">Skell:</v-list-item-title>
                        <v-list-item-subtitle>
                          <a :href="skellUrl" target="_blank" rel="noopener noreferrer"
                            class="text-decoration-none text-blue-darken-1 url-link-text">
                            {{ skellUrl }}
                            <v-icon size="small">mdi-open-in-new</v-icon>
                          </a>
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>

                    <v-list-item class="mb-2 rounded-lg elevation-1" color="blue-lighten-5">
                      <v-list-item-content>
                        <v-list-item-title class="font-weight-medium text-purple-darken-2">Oxford Learner's
                          Dictionaries:</v-list-item-title>
                        <v-list-item-subtitle>
                          <a :href="oxfordUrl" target="_blank" rel="noopener noreferrer"
                            class="text-decoration-none text-blue-darken-1 url-link-text">
                            {{ oxfordUrl }}
                            <v-icon size="small">mdi-open-in-new</v-icon>
                          </a>
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-card-text>
            </v-expand-transition>

            <!-- フッターセクション -->
            <v-card-actions class="justify-center mt-4">
              <p class="text-caption text-medium-emphasis text-center">
                ※このアプリは、検索した単語と生成したURLをデータベースに保存します。
              </p>
            </v-card-actions>
          </v-card>
        </v-responsive>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface SearchApiResponse {
  search_query: string;
  weblio_url: string;
  skell_url: string;
  oxford_url: string;
}

interface ErrorApiResponse {
  error: string;
}

const searchQuery = ref<string>('');
const weblioUrl = ref<string>('');
const skellUrl = ref<string>('');
const oxfordUrl = ref<string>('');
const errorMessage = ref<string>('');
const loading = ref<boolean>(false);

const backendPort = 3000; // Node.jsバックエンドのポート番号
const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:${backendPort}`;

const searchWord = async () => {
  errorMessage.value = '';
  weblioUrl.value = '';
  skellUrl.value = '';
  oxfordUrl.value = '';
  loading.value = true;

  if (!searchQuery.value.trim()) {
    errorMessage.value = '検索単語を入力してください。';
    loading.value = false;
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(searchQuery.value.trim())}`);
    console.log(response);

    if (!response.ok) {
      const errorData: ErrorApiResponse = await response.json();
      throw new Error(errorData.error || `APIからの応答に失敗しました。ステータス: ${response.status}`);
    }

    const data: SearchApiResponse = await response.json();
    weblioUrl.value = data.weblio_url;
    skellUrl.value = data.skell_url;
    oxfordUrl.value = data.oxford_url;
    console.log('検索履歴が保存されました:', data.search_query);

  } catch (error: any) {
    console.error('API呼び出しエラー:', error);
    errorMessage.value = `エラー: ${error.message || '不明なエラーが発生しました。'}`;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Scopedスタイルは、Vuetifyのコンポーネントが提供するCSSに干渉しないように、最小限に抑えるのが一般的です。 */
/* Vuetifyのクラスやユーティリティを使うことで、ほとんどのスタイルは直接コンポーネントに適用できます。 */

/* 長いURLの折り返し */
.url-link-text {
  word-break: break-all;
}

/* マテリアルデザインアイコンの読み込み確認 */
/* @mdi/font が正しく読み込まれていれば、通常はこれらのスタイルは不要です */
@import url('https://cdn.jsdelivr.net/npm/@mdi/font@6.x/css/materialdesignicons.min.css');

/* 必要に応じてグローバルなフォント設定など (main.tsで設定することも可能) */
body {
  font-family: 'Roboto', 'Noto Sans JP', sans-serif;
  /* マテリアルデザインの標準フォント */
}

/* v-app の背景色を全体に適用するためのスタイル */
/* Vercelのデプロイでbodyの背景が適用されない場合、v-appに直接スタイルを適用することもできます */
.v-application {
  background-color: #f5f5f5 !important;
  /* 例: ライトグレーの背景 */
}
</style>
