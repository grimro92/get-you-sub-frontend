<template>
  <v-app>
    <v-main class="d-flex align-center justify-center bg-grey-lighten-3">
      <v-container class="pa-4 pa-sm-6 pa-md-8" fluid>
        <v-responsive max-width="800" class="mx-auto">
          <v-card class="pa-6 pa-sm-8 rounded-xl elevation-10" color="white">
            <v-card-title class="text-h4 text-sm-h3 text-center font-weight-bold text-blue-darken-3 mb-4">
              🎬 YouTube字幕ダウンローダー
            </v-card-title>
            <v-card-subtitle class="text-subtitle-1 text-sm-h6 text-center text-medium-emphasis mb-6">
              YouTube動画の字幕をダウンロードし、データベースに保存します。
            </v-card-subtitle>

            <v-card-text>
              <v-row no-gutters class="align-center justify-center">
                <v-col cols="12" md="8" class="pr-md-2 mb-4 mb-md-0">
                  <v-text-field
                    v-model="youtubeUrl"
                    @keyup.enter="downloadSubtitles"
                    label="YouTube動画のURLを入力してください"
                    variant="outlined"
                    density="comfortable"
                    clearable
                    hide-details
                    :loading="loading"
                    :disabled="loading"
                    class="rounded-lg"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-btn
                    @click="downloadSubtitles"
                    :disabled="loading"
                    :loading="loading"
                    color="blue-darken-2"
                    size="large"
                    block
                    class="rounded-lg elevation-5"
                  >
                    <v-icon left>mdi-download</v-icon>
                    {{ loading ? 'ダウンロード中...' : '字幕をダウンロード' }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-text v-if="message" class="pt-0 pb-4">
              <v-alert :type="isSuccess ? 'success' : 'error'" icon="mdi-information-outline" variant="tonal" class="rounded-lg">
                {{ message }}
              </v-alert>
            </v-card-text>

            <v-expand-transition>
              <v-card-text v-if="subtitlesData && Object.keys(subtitlesData).length > 0" class="pt-0 pb-4">
                <v-card class="pa-4 rounded-lg elevation-2 bg-grey-lighten-4">
                  <v-card-title class="text-h6 font-weight-bold text-center text-blue-grey-darken-2">
                    📄 ダウンロードされた字幕プレビュー
                  </v-card-title>
                  <v-list dense class="bg-transparent">
                    <div v-for="(subs, lang) in subtitlesData" :key="lang" class="mb-4">
                      <v-list-item class="rounded-lg elevation-1 bg-white mb-2" color="blue-lighten-5">
                        <v-list-item-title class="font-weight-medium text-purple-darken-2 text-capitalize">
                          {{ lang }} 字幕:
                        </v-list-item-title>
                        <v-list-item-subtitle class="mt-2">
                          <p v-for="(entry, index) in subs.slice(0, 5)" :key="index" class="text-body-2 mb-1">
                            **[{{ (entry.start).toFixed(2) }}s - {{ (entry.start + entry.duration).toFixed(2) }}s]**: {{ entry.text }}
                          </p>
                          <p v-if="subs.length > 5" class="text-body-2 text-medium-emphasis">
                            ...他 {{ subs.length - 5 }} 件
                          </p>
                        </v-list-item-subtitle>
                      </v-list-item>
                    </div>
                  </v-list>
                </v-card>
              </v-card-text>
            </v-expand-transition>

            <v-card-actions class="justify-center mt-4">
              <p class="text-caption text-medium-emphasis text-center">
                ※このアプリは、YouTube動画の字幕データをダウンロードし、データベースに保存します。
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
import axios from 'axios'; // axiosをインポート

interface SubtitleSegment {
  text: string;
  start: number;
  duration: number;
}

interface DownloadApiResponse {
  message: string;
  videoId: string;
  subtitles?: { [key: string]: SubtitleSegment[] }; // 字幕データはオプション
}

interface ErrorApiResponse {
  error: string;
  details?: string; // 詳細なエラーメッセージも受け取れるように
}

const youtubeUrl = ref<string>('');
const message = ref<string>('');
const isSuccess = ref<boolean>(false);
const loading = ref<boolean>(false);
const subtitlesData = ref<{ [key: string]: SubtitleSegment[] } | null>(null);

const backendPort = 3000;
const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:${backendPort}`;

const downloadSubtitles = async () => {
  message.value = '';
  subtitlesData.value = null; // 新しいダウンロード開始時に以前のデータをクリア
  loading.value = true;

  if (!youtubeUrl.value.trim()) {
    message.value = 'YouTube URLを入力してください。';
    isSuccess.value = false;
    loading.value = false;
    return;
  }

  try {
    const response = await axios.post<DownloadApiResponse>(`${API_BASE_URL}/download-subtitles`, {
      youtubeUrl: youtubeUrl.value.trim(),
    });

    message.value = response.data.message || '字幕のダウンロードと保存が完了しました。';
    isSuccess.value = true;
    subtitlesData.value = response.data.subtitles || null; // 字幕データをセット

    // 成功したら入力フィールドをクリア
    youtubeUrl.value = '';

  } catch (error: any) {
    console.error('API呼び出しエラー:', error);
    isSuccess.value = false;
    if (axios.isAxiosError(error) && error.response) {
      const errorData: ErrorApiResponse = error.response.data;
      message.value = `エラー: ${errorData.error || '不明なエラーが発生しました。'}${errorData.details ? ` (${errorData.details})` : ''}`;
    } else {
      message.value = `エラー: ${error.message || '不明なエラーが発生しました。'}`;
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* スタイルは変更なしでOKですが、必要に応じて調整してください */
.url-link-text {
  word-break: break-all;
}

@import url('https://cdn.jsdelivr.net/npm/@mdi/font@6.x/css/materialdesignicons.min.css');

body {
  font-family: 'Roboto', 'Noto Sans JP', sans-serif;
}

.v-application {
  background-color: #f5f5f5 !important;
}
</style>