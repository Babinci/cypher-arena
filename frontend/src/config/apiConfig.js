const apiConfig = {
  baseUrl: '/api/',
  endpoints: {
    getRandomWord: 'words/get_random_word/',
    getTopic: 'words/get_topics/',
    getImages: 'images_mode/images/',
    createFeedback: 'user_management/create-feedback/',
    trackUserVisit: 'user_management/track-visit/',
    getContrastPairs: 'words/contrast-pairs/',
    rateContrastPair: 'words/contrast-pairs/',
    addTagToContrastPair: 'words/contrast-pairs/'
  }
};

export default apiConfig;