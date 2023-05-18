import React, { useContext, useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { Button, Card, Dialog, IconButton, Portal, Text, TextInput, useTheme } from 'react-native-paper'
import { LoginContext } from './Contexts'
import GenerativeLanguageService from './GenerativeLanguageService'
import { LoadingAnimation } from './Layouts'
import { ActivityModel, FaqModel } from './Models'
import styles from './Styles'

interface FaqState {
  Topics: Array<TopicState>
}

interface TopicState {
  Topic: string
  Question: string
  Answers: Array<AnswerState>
  IsExpanded?: boolean
}

interface AnswerState {
  Answer: string
}

function stateFromModel(model: FaqModel | undefined): FaqState {
  const questions: Array<TopicState> = []
  if (model && model.Topics) {
    for (const topic of model.Topics) {
      const answers: Array<AnswerState> = topic.Answers.map((answer) => {
        return {
          Answer: answer,
        }
      })
      questions.push({
        Topic: topic.Topic,
        Question: topic.Question,
        Answers: answers,
      })
    }
  }
  return { Topics: questions }
}

function modelFromState(state: FaqState): FaqModel | undefined {
  return state.Topics.length === 0 ? undefined : {
    Topics: state.Topics.map((q) => {
      return {
        Topic: q.Topic,
        Question: q.Question,
        Answers: q.Answers.map((a) => a.Answer),
      }
    })
  }
}

interface ActivityFaqProps {
  faq: FaqModel | undefined
  setFaq: (faq: FaqModel | undefined) => void
  // Partially populated activity.
  activity: Partial<ActivityModel>
  // Placeholder for the activity name while not populated.
  namePlaceholder: string
}

const ActivityFaq = (props: ActivityFaqProps): JSX.Element => {
  const loginContext = useContext(LoginContext)!
  const theme = useTheme()

  const [faqState, setFaqState] = useState<FaqState>(stateFromModel(props.faq))

  // Update the activity model whenever the FAQ is updated.
  useEffect(() => props.setFaq(modelFromState(faqState)), [faqState])

  const [editingQuestion, setEditingQuestion] = useState<TopicState>()
  const [editingQuestionIdx, setEditingQuestionIdx] = useState<number>()

  const [updating, setUpdating] = useState(false)

  async function generateFaq() {
    setUpdating(true)
    GenerativeLanguageService.get(loginContext.Credentials.GoogleCloudApiKey)
      .generateActivityFaq({
        name: props.activity.Name || props.namePlaceholder,
        count: 5,
        prefix: modelFromState(faqState),
      })
      .then(stateFromModel)
      .then(setFaqState)
      .catch(console.error)
      .finally(() => setUpdating(false))
  }

  function toggleExpandQuestion(questionIdx: number) {
    const questions: Array<TopicState> = []
    faqState.Topics.forEach((q, i) => {
      questions.push({
        ...q,
        IsExpanded: (i === questionIdx) ? !q.IsExpanded : false /* Minimize other questions */,
      })
    })
    setFaqState({ Topics: questions })
  }

  function beginEditingQuestion(questionIdx: number) {
    setEditingQuestion(faqState.Topics[questionIdx]!)
    setEditingQuestionIdx(questionIdx)
  }

  function clearEditingQuestion() {
    setEditingQuestion(undefined)
    setEditingQuestionIdx(undefined)
  }

  function saveEditingQuestion() {
    const questions: Array<TopicState> = []
    faqState.Topics.forEach((q, i) => {
      questions.push((i === editingQuestionIdx) ? editingQuestion! : q)
    })
    setFaqState({ Topics: questions })
    clearEditingQuestion()
  }

  function addQuestion() {
    const minimizedTopics: Array<TopicState> = faqState.Topics.map((t) => { return { ...t, IsExpanded: false } })
    setFaqState({ Topics: [...minimizedTopics, { Topic: '', Question: '', Answers: [{ Answer: '' }], IsExpanded: true }] })
  }

  function deleteQuestion(topicIdx: number) {
    setFaqState({ Topics: faqState.Topics.filter((q, i) => i !== topicIdx) })
  }

  return (
    <Card mode="contained" style={{ backgroundColor: 'transparent' }}>
      <Card.Title
        title="FAQ"
        titleVariant="titleMedium"
        right={() => <IconButton icon="close" size={20} onPress={() => setFaqState(stateFromModel(undefined))} />}
      />
      <Card.Content>
        <View style={{ flexDirection: 'column' }}>
          {faqState.Topics.map((question, questionIdx) => {
            return (
              <Card
                key={questionIdx}
                mode="contained"
                style={{
                  backgroundColor: 'transparent',
                  borderRadius: theme.roundness,
                  marginBottom: 6,
                }}>
                <Card.Title
                  style={{ minHeight: 50, paddingLeft: 0 }}
                  title={question.Topic || `Topic${questionIdx === 0 ? '' : ` ${questionIdx + 1}`}`}
                  titleNumberOfLines={2}
                  titleVariant="titleMedium"
                  titleStyle={{ paddingTop: 3 }}
                  left={() => <IconButton mode='contained' icon={question.IsExpanded ? 'minus' : 'plus'} size={20} onPress={() => toggleExpandQuestion(questionIdx)} />}
                  right={() => {
                    return (
                      <View style={{ flexDirection: 'row', marginLeft: 'auto', justifyContent: 'center', alignItems: 'center' }}>
                        {question.IsExpanded &&
                          <>
                            <IconButton icon='pencil' size={24} style={{ margin: 0 }} onPress={() => beginEditingQuestion(questionIdx)} />
                            <IconButton icon='delete' size={24} style={{ margin: 0 }} onPress={() => deleteQuestion(questionIdx)} />
                          </>
                        }
                      </View>
                    )
                  }}
                />
                {question.IsExpanded &&
                  <Card.Content style={{ paddingHorizontal: 0 }}>
                    <Card
                      mode="contained"
                      style={{ backgroundColor: 'transparent' }}
                    >
                      <Card.Content style={{ padding: 12 }}>
                        <View>
                          <Text style={styles.text} variant='bodyLarge'>
                            {question.Question || `Question${questionIdx === 0 ? '' : ` ${questionIdx + 1}`}`}
                          </Text>
                        </View>
                        <View>
                          {question.Answers.map((answer, answerIdx) => {
                            return (
                              <View key={answerIdx} style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                {(question.Answers.length || 0) > 1 &&
                                  <Text variant='bodyLarge' style={{ width: 24, textAlign: 'center' }}>•</Text>
                                }
                                <Text variant='bodyLarge' style={{ flexGrow: 1 }}>
                                  {answer.Answer || `Answer${answerIdx === 0 ? '' : ` ${answerIdx + 1}`}`}
                                </Text>
                              </View>
                            )
                          })}
                        </View>
                      </Card.Content>
                    </Card>
                  </Card.Content>
                }
              </Card>
            )
          })}
          {updating && <LoadingAnimation />}
        </View>
        <Portal>
          <Dialog
            dismissable
            onDismiss={clearEditingQuestion}
            style={{
              shadowColor: theme.colors.shadow,
              shadowRadius: theme.roundness,
              borderColor: theme.colors.surfaceDisabled,
              borderRadius: theme.roundness,
              borderWidth: 1,
            }}
            visible={editingQuestionIdx != undefined}
          >
            <Dialog.Title>Edit FAQ</Dialog.Title>
            <Dialog.ScrollArea>
              <ScrollView>
                <View style={{ flexDirection: 'column' }}>
                  <TextInput
                    autoCapitalize='words'
                    autoComplete='off'
                    inputMode='text'
                    mode='flat'
                    onChangeText={(text) => setEditingQuestion({ ...editingQuestion!, Topic: text })}
                    placeholder='Topic'
                    style={{ backgroundColor: 'transparent' }}
                    value={editingQuestion?.Topic}
                  />
                  <TextInput
                    autoCapitalize='sentences'
                    autoComplete='off'
                    inputMode='text'
                    mode='flat'
                    multiline={true}
                    onChangeText={(text) => setEditingQuestion({ ...editingQuestion!, Question: text })}
                    placeholder='Question'
                    style={{ backgroundColor: 'transparent' }}
                    value={editingQuestion?.Question}
                  />
                  <View style={(editingQuestion?.Answers.length || 0) > 1 && { paddingLeft: 24 }}>
                    {editingQuestion && editingQuestion.Answers.map((answer, answerIdx) => {
                      return (
                        <View key={answerIdx} style={{ flexDirection: 'row' }}>
                          <TextInput
                            autoCapitalize='sentences'
                            autoComplete='off'
                            inputMode='text'
                            mode='flat'
                            multiline={true}
                            onChangeText={(text) => {
                              const editedAnswer: AnswerState = { ...editingQuestion!.Answers[answerIdx], Answer: text }
                              const editedAnswers = editingQuestion!.Answers.map((a, i) => (i === answerIdx) ? editedAnswer : a)
                              setEditingQuestion({ ...editingQuestion, Answers: editedAnswers })
                            }}
                            placeholder={`Answer${answerIdx === 0 ? '' : ` ${answerIdx + 1}`}`}  // 'Answer', 'Answer 2', etc.
                            style={{
                              backgroundColor: 'transparent',
                              flexGrow: 1,
                              flexBasis: '85%',
                            }}
                            value={answer.Answer}
                          />
                          {editingQuestion?.Answers.length > 1 &&
                            <IconButton icon='delete' size={20} style={{ margin: 0, alignSelf: 'center' }} onPress={() => {
                              const editedAnswers = editingQuestion!.Answers.filter((a, i) => i !== answerIdx)
                              setEditingQuestion({ ...editingQuestion, Answers: editedAnswers })
                            }} />
                          }
                        </View>
                      )
                    })}
                  </View>
                </View>
              </ScrollView>
            </Dialog.ScrollArea>
            <Dialog.Actions>
              {editingQuestion &&
                <Button mode='outlined' style={styles.button} onPress={() => {
                  const editedAnswers: Array<AnswerState> = [...editingQuestion!.Answers, { Answer: '' }]
                  setEditingQuestion({ ...editingQuestion, Answers: editedAnswers })
                }}>
                  + Answer
                </Button>
              }
              <Button mode='contained' style={styles.button} onPress={saveEditingQuestion}>
                Save
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </Card.Content>
      <Card.Actions>
        <Button mode='outlined' style={styles.button} onPress={generateFaq}>
          Suggest
        </Button>
        <Button mode='outlined' style={styles.button} onPress={addQuestion}>
          + Topic
        </Button>
      </Card.Actions>
    </Card>
  )
}

export default ActivityFaq