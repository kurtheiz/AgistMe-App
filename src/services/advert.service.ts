interface Advert {
    id: string;
    advertType: string;
    externalLink: string;
    link: string;
    locationFocus: boolean;
}

class AdvertService {
    private static instance: AdvertService;
    private readonly baseUrl = import.meta.env.VITE_API_BASE_URL;

    private constructor() {}

    public static getInstance(): AdvertService {
        if (!AdvertService.instance) {
            AdvertService.instance = new AdvertService();
        }
        return AdvertService.instance;
    }

    public async getAdverts(): Promise<Advert[]> {
        try {
            const response = await fetch(`${this.baseUrl}/v1/adverts`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch adverts: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching adverts:', error);
            return [];
        }
    }

    public async getPremiumAdverts(): Promise<Advert[]> {
        const adverts = await this.getAdverts();
        return adverts.filter(advert => advert.advertType === 'PREMIUM');
    }

    public async getLocationFocusedAdverts(): Promise<Advert[]> {
        const adverts = await this.getAdverts();
        return adverts.filter(advert => advert.locationFocus);
    }
}

export const advertService = AdvertService.getInstance();
export type { Advert };
