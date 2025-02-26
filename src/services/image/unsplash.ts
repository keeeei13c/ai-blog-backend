interface UnsplashResponse {
  urls: {
    regular: string;
  };
}

export class UnsplashService {
  private readonly defaultImage = "https://placehold.co/600x400";
  private readonly accessKey = "2cmadwxXPUM2mHBEdlNL7HN5a6eX9JvrZVkoWpbP3kc";

  async getImage(keywords: string[]): Promise<string> {
    if (!this.accessKey) {
      console.error("Unsplash API access key is missing.");
      return this.defaultImage;
    }

    const keyword = keywords.join(",");

    try {
      const response = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(keyword)}&client_id=${this.accessKey}`
      );
      if (!response.ok) {
        console.error("Failed to fetch image from Unsplash API:", response.statusText);
        return this.defaultImage;
      }
      const data = await response.json() as UnsplashResponse;
      return data.urls?.regular || this.defaultImage;
    } catch (error) {
      console.error("Error fetching image from Unsplash API:", error);
      return this.defaultImage;
    }
  }
}
