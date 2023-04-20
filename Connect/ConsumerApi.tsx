
export interface ProfileModel {
  UserID: string,
  PhoneNumber: string,
  CreatedTimestampMillis: number,
  Name: string | null,
  EmailAddress: string | null,
  Image: ImageModel | null,
  LastUpdatedTimestampMillis: number | null
}

export interface ImageModel {
  ID: string,
  UserID: string,
  CreatedTimestampMillis: number,
  URL: string,
}

interface User {
  uid: string,
  getIdToken: () => Promise<string>
}

interface AuthRequest {
  id: string,
  token: string
}

interface GetOrCreateProfileRequest {
  phoneNumber: string
}

interface UpdateProfileRequest {
  name: string | null,
  emailAddress: string | null
}

export class ConsumerApi {
  private static baseUrlProd_ = "https://connect-on-firebase.wm.r.appspot.com";

  public static get(user: User): ConsumerApi {
    return new ConsumerApi(user, ConsumerApi.baseUrlProd_);
  }

  private user_: User;
  private baseUrl_: string;

  private constructor(user: User, baseUrl: string) {
    this.user_ = user;
    this.baseUrl_ = baseUrl;
  }

  async getOrCreateProfile(req: GetOrCreateProfileRequest): Promise<ProfileModel> {
    return this.newAuthRequest_().then((authParams) => {
      const params = {
        ...authParams,
        ...req,
      };
      return this.doPost_('/profile/getorcreate', params);
    }).then(async resp => {
      if (resp.ok) {
        return resp.json();
      } else {
        return resp.text().then((body) => Promise.reject(`Error (${resp.status}): ${body}`));
      }
    });
  }

  async updateProfile(req: UpdateProfileRequest): Promise<ProfileModel> {
    return this.newAuthRequest_().then((authParams) => {
      const params = {
        ...authParams,
        ...req,
      };
      return this.doPost_('/profile/update', params);
    }).then(async resp => {
      if (resp.ok) {
        return resp.json();
      } else {
        return resp.text().then((body) => Promise.reject(`Error (${resp.status}): ${body}`));
      }
    });
  }

  private async newAuthRequest_(): Promise<AuthRequest> {
    return this.user_.getIdToken().then((token) => {
      return {
        id: this.user_.uid,
        token: token,
      };
    });
  }

  private async doGet_(endpoint: string, params: any): Promise<Response> {
    const url = this.generateUrl_(endpoint, params);
    return fetch(url);
  }

  private async doPost_(endpoint: string, params: any): Promise<Response> {
    const url = this.generateUrl_(endpoint, {});
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: this.encodeParams_(params),
    });
  }

  private generateUrl_(endpoint: string, params: any): string {
    return `${this.baseUrl_}${endpoint}?${this.encodeParams_(params)}`;
  }

  private encodeParams_(params: any): string {
    return Object.entries(params).map(([key, value]) => `${key}=${encodeURIComponent('' + value)}`).join("&");
  }
}