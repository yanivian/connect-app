/** This file defines a functional interface to Google's Generative Language REST API. */
import { FaqModel, FaqTopicModel } from './Models'

interface GenerateTextRequest {
  prompt: { text: string }
  maxOutputTokens: number
  temperature: number
}

interface GenerateTextResponse {
  candidates: Array<{ output: string }>
}

interface GenerateActivityFaqRequest {
  // Name of the activity, or proxy such as a placeholder.
  name: string
  // Number of additional activities to generate.
  count: number
  // FAQ that is prefixed to the generated model.
  prefix?: FaqModel
}

export default class GenerativeLanguageService {

  private static baseUrl_ = 'https://generativelanguage.googleapis.com/v1beta2'

  static get(apiKey: string): GenerativeLanguageService {
    return new GenerativeLanguageService(apiKey)
  }

  private apiKey_: string

  private constructor(apiKey: string) {
    this.apiKey_ = apiKey
  }

  async generateActivityFaq(props: GenerateActivityFaqRequest): Promise<FaqModel> {
    console.info(`GenerativeLanguageService::generateActivityFaq Request: ${JSON.stringify(props)}`)

    const exampleTopic: FaqTopicModel = {
      Topic: "Location",
      Question: "Where will the activity be held?",
      Answers: ["Home", "Work", "Park", "Cafe", "Diner"],
    }
    const prefixTopics: Array<FaqTopicModel> = props.prefix?.Topics || []

    const context = `You provide "${props.name}" as an activity session to prospective clients.`
    const query = `What are the top ${props.count + prefixTopics.length + 1} questions about the session that prospective clients may have in order to better understand, disambiguate or clarify the details and nature of the session? For each question, what are the top 5 applicable discrete answers or ranges of values? Do not include questions related to location, duration or schedule.`

    const example = JSON.stringify(exampleTopic)
    const prefix = prefixTopics.map((topic) => JSON.stringify(topic)).join(",")
    const starter = `{"Topics": [${example},${prefixTopics.length === 0 ? '' : `${prefix},`}{"Topic": "`
    const prompt = `${context}\n\n${query}\n\nRespond in JSON.\n\n${starter}`

    const req: GenerateTextRequest = {
      maxOutputTokens: 2048,
      prompt: { text: prompt },
      temperature: .05,
    }
    const respPromise: Promise<GenerateTextResponse> = this.doPost_('/models/text-bison-001:generateText', { key: this.apiKey_ }, req)
    return respPromise.then((resp) => {
      const jsonStr = `{"Topics": [${prefixTopics.length === 0 ? '' : `${prefix},`}{"Topic": "${resp.candidates![0].output}}`
      console.info(`GenerativeLanguageService::generateActivityFaq Response: ${jsonStr}`)
      return JSON.parse(jsonStr)
    })
  }

  private async doPost_<RequestType, ResponseType>(endpoint: string, params: any, req: RequestType): Promise<ResponseType> {
    const url = this.generateUrl_(endpoint, params)
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    }).then(async (resp) => {
      if (resp.ok) {
        return resp.json()
      } else {
        return resp.text().then((body) => Promise.reject(`Error (${resp.status}): ${body}`))
      }
    })
  }

  private generateUrl_(endpoint: string, params: any): string {
    return `${GenerativeLanguageService.baseUrl_}${endpoint}?${this.encodeParams_(params)}`
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