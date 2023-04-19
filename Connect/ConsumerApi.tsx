
export interface ProfileModel {
  UserID: string,
  PhoneNumber: string,
  CreatedTimestampMillis: number,
  Name: string | null,
  EmailAddress: string | null,
  LastUpdatedTimestampMillis: number | null
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
    console.log('getOrCreateProfile');
    return this.newAuthRequest_().then((authParams) => {
      const params = {
        ...authParams,
        ...req,
      };
      const url = this.generateUrl_("/profile/getorcreate", params);
      return fetch(url, { method: 'POST' });
    }).then(async resp => {
      if (resp.ok) {
        return resp.json();
      } else {
        return resp.text().then((body) => Promise.reject(`Error (${resp.status}): ${body}`));
      }
    });
  }

  async updateProfile(req: UpdateProfileRequest): Promise<ProfileModel> {
    console.log('updateProfile');
    return this.newAuthRequest_().then((authParams) => {
      const params = {
        ...authParams,
        ...req,
      };
      const url = this.generateUrl_("/profile/update", params);
      console.log(url);
      return fetch(url, { method: 'POST' });
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

  private generateUrl_(endpoint: string, params: any): string {
    const encodedParams = Object.entries(params).map(([key, value]) => `${key}=${encodeURIComponent('' + value)}`).join("&");
    return `${this.baseUrl_}${endpoint}?${encodedParams}`;
  }
}