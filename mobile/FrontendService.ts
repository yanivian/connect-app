/** This file defines a functional interface to the frontend service. */

import { ConnectionAddedModel, ContactModel, ImageModel, InviteModel, LoginContextModel, ProfileModel, UserApi, UserInfo } from './Models'

interface AuthRequest {
  id: string
  token: string
}

interface LoginContextRequest {
  phoneNumber: string
}

interface UpdateProfileRequest {
  name: string | null
  emailAddress: string | null
  image: string | null
}

interface LocalFile {
  name: string,
  type: string,
  uri: string,
}

export default class FrontendService {
  private static baseUrlProd_ = "https://connect-on-firebase.wm.r.appspot.com"

  public static get(userApi: UserApi): FrontendService {
    return new FrontendService(userApi, FrontendService.baseUrlProd_)
  }

  private userApi_: UserApi
  private baseUrl_: string

  private constructor(userApi: UserApi, baseUrl: string) {
    this.userApi_ = userApi
    this.baseUrl_ = baseUrl
  }

  async refreshDeviceToken(deviceToken: string | undefined): Promise<{}> {
    return this.newAuthRequest_().then((authParams) => {
      const params = {
        ...authParams,
        deviceToken,
      }
      return this.doPost_('/profile/refreshdevicetoken', params)
    }).then(async resp => {
      if (resp.ok) {
        return resp.json()
      } else {
        return resp.text().then((body) => Promise.reject(`Error (${resp.status}): ${body}`))
      }
    })
  }

  async addConnection(targetUser: UserInfo): Promise<ConnectionAddedModel> {
    return this.newAuthRequest_().then((authParams) => {
      const params = {
        ...authParams,
        targetUserID: targetUser.UserID,
      }
      return this.doPost_('/connection/add', params)
    }).then(async resp => {
      if (resp.ok) {
        return resp.json()
      } else {
        return resp.text().then((body) => Promise.reject(`Error (${resp.status}): ${body}`))
      }
    })
  }

  async inviteContact(contact: ContactModel): Promise<InviteModel> {
    return this.newAuthRequest_().then((authParams) => {
      const params = {
        ...authParams,
        name: contact.Name,
        phoneNumber: contact.PhoneNumber.number,
      }
      return this.doPost_('/contact/update', params)
    }).then(async resp => {
      if (resp.ok) {
        return resp.json()
      } else {
        return resp.text().then((body) => Promise.reject(`Error (${resp.status}): ${body}`))
      }
    })
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
    return this.userApi_.getIdToken().then((token) => {
      return {
        id: this.userApi_.uid,
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