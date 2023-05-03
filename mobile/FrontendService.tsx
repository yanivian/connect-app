/** This file defines a functional interface to the frontend service. */

import { ImageModel, LoginContextModel, ProfileModel, UserModel } from './Models'

interface AuthRequest {
  id: string,
  token: string,
}

interface LoginContextRequest {
  phoneNumber: string,
  client: string,
}

interface UpdateProfileRequest {
  name: string | null,
  emailAddress: string | null,
  image: string | null,
}

interface LocalFile {
  name: string,
  type: string,
  uri: string,
}

export default class FrontendService {
  private static baseUrlProd_ = "https://connect-on-firebase.wm.r.appspot.com"

  public static get(user: UserModel): FrontendService {
    return new FrontendService(user, FrontendService.baseUrlProd_)
  }

  private user_: UserModel
  private baseUrl_: string

  private constructor(user: UserModel, baseUrl: string) {
    this.user_ = user
    this.baseUrl_ = baseUrl
  }

  async loginContext(req: LoginContextRequest): Promise<LoginContextModel> {
    return this.newAuthRequest_().then((authParams) => {
      const params = {
        ...authParams,
        ...req,
      }
      return this.doPost_('/user/login', params)
    }).then(async resp => {
      if (resp.ok) {
        return resp.json()
      } else {
        return resp.text().then((body) => Promise.reject(`Error (${resp.status}): ${body}`))
      }
    })
  }

  async updateProfile(req: UpdateProfileRequest): Promise<ProfileModel> {
    return this.newAuthRequest_().then((authParams) => {
      const params = {
        ...authParams,
        ...req,
      }
      return this.doPost_('/profile/update', params)
    }).then(async resp => {
      if (resp.ok) {
        return resp.json()
      } else {
        return resp.text().then((body) => Promise.reject(`Error (${resp.status}): ${body}`))
      }
    })
  }

  async uploadImage(pickedImage: LocalFile): Promise<ImageModel> {
    return this.newAuthRequest_().then((authParams) => {
      return this.doPostWithFilePart_('/image/upload', authParams, pickedImage)
    }).then(async resp => {
      if (resp.ok) {
        return resp.json()
      } else {
        return resp.text().then((body) => Promise.reject(`Error (${resp.status}): ${body}`))
      }
    })
  }

  private async newAuthRequest_(): Promise<AuthRequest> {
    return this.user_.getIdToken().then((token) => {
      return {
        id: this.user_.uid,
        token: token,
      }
    })
  }

  private async doGet_(endpoint: string, params: any): Promise<Response> {
    const url = this.generateUrl_(endpoint, params)
    return fetch(url)
  }

  private async doPost_(endpoint: string, params: any): Promise<Response> {
    const url = this.generateUrl_(endpoint, {})
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: this.encodeParams_(params),
    })
  }

  private async doPostWithFilePart_(endpoint: string, params: any, localFile: LocalFile): Promise<Response> {
    const url = this.generateUrl_(endpoint, {})
    const data = new FormData()
    data.append('image', localFile)
    Object.entries(params).forEach(([key, value]) => data.append(key, value))
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: data,
    })
  }

  private generateUrl_(endpoint: string, params: any): string {
    return `${this.baseUrl_}${endpoint}?${this.encodeParams_(params)}`
  }

  private encodeParams_(params: any): string {
    return Object.entries(params).map(([key, value]) => {
      if (!value) {
        return ''
      }
      return `${key}=${encodeURIComponent('' + value)}`
    }).join("&")
  }
}