import React, { useState } from 'react'
import { View } from 'react-native'
import { Button, Card, Checkbox, IconButton, Text, useTheme } from 'react-native-paper'
import { FaqModel } from './Models'
import styles from './Styles'

interface FaqState {
  Questions: Array<QuestionState>
}

interface QuestionState {
  Topic: string
  Question: string
  Answers: Array<AnswerState>
  IsSelected?: boolean
  IsExpanded?: boolean
  IsEditing?: boolean
}

interface AnswerState {
  Answer: string
  IsSelected?: boolean
  IsEditing?: boolean
}

interface ActivityFaqProps {
  faq: FaqModel
  setFaq: (faq: FaqModel | undefined) => void
}

function stateFromModel(model: FaqModel): FaqState {
  const questions: Array<QuestionState> = []
  for (const [questionIdx, question] of model.Questions.entries()) {
    const answers: Array<AnswerState> = question.Answers.map((answer) => {
      return {
        Answer: answer,
      }
    })
    questions.push({
      Topic: question.Topic,
      Question: question.Question,
      Answers: answers,
      IsSelected: answers.length > 0 && answers.map((answer) => answer.IsSelected).reduce((p, c) => p || c),
      IsExpanded: (questionIdx === 0) /* Expand the first question */,
    })
  }
  return { Questions: questions }
}

function modelFromState(state: FaqState): FaqModel {
  return {
    Questions: state.Questions.filter((q) => q.IsSelected).map((q) => {
      return {
        Topic: q.Topic,
        Question: q.Question,
        Answers: q.Answers.filter((a) => a.IsSelected).map((a) => a.Answer),
      }
    })
  }
}

const ActivityFaq = (props: ActivityFaqProps): JSX.Element => {
  const [faqState, setFaqState] = useState<FaqState>(stateFromModel(props.faq))

  const theme = useTheme()

  function saveModel() {
    props.setFaq(modelFromState(faqState))
  }

  function toggleExpandQuestion(questionIdx: number) {
    const questions: Array<QuestionState> = []
    faqState.Questions.forEach((q, i) => {
      questions.push({
        ...q,
        IsExpanded: (i === questionIdx) ? !q.IsExpanded : false /* Minimize other questions */,
      })
    })
    setFaqState({ Questions: questions })
  }

  function toggleSelectAnswer(questionIdx: number, answerIdx: number) {
    const questions: Array<QuestionState> = []
    faqState.Questions.forEach((q, i) => {
      const answers: Array<AnswerState> = []
      q.Answers.forEach((a, j) => {
        answers.push({
          ...a,
          IsSelected: (i === questionIdx && j === answerIdx) ? !a.IsSelected : a.IsSelected,
        })
      })
      questions.push({
        ...q,
        Answers: answers,
        IsSelected: answers.map((answer) => answer.IsSelected).reduce((p, c) => p || c),
      })
    })
    setFaqState({ Questions: questions })
    saveModel()
  }

  return (
    <Card mode="outlined" style={{
      backgroundColor: theme.colors.backdrop,
      borderRadius: theme.roundness,
    }}>
      <Card.Title
        title="FAQ"
        titleVariant="titleMedium"
        right={() => <IconButton icon="close" size={20} onPress={() => props.setFaq(undefined)} />}
      />
      <Card.Content>
        <View style={{ flexDirection: 'column' }}>
          {faqState.Questions.map((question, questionIdx) => {
            return (
              <Card
                key={questionIdx}
                mode="contained"
                style={{
                  backgroundColor: theme.colors.backdrop,
                  borderRadius: theme.roundness,
                  marginBottom: 6,
                }}>
                <Card.Title
                  style={{ minHeight: 50, paddingLeft: 0 }}
                  title={`${question.IsSelected && "✓ " || ""}${question.Topic}`}
                  titleVariant="titleMedium"
                  titleStyle={{ paddingTop: 3, color: question.IsSelected ? theme.colors.primary : theme.colors.inverseSurface }}
                  left={() => <IconButton mode='contained' icon={question.IsExpanded ? 'minus' : 'plus'} size={20} onPress={() => toggleExpandQuestion(questionIdx)} />}
                  right={() => {
                    return (
                      <View style={{ flexDirection: 'row', marginLeft: 'auto', justifyContent: 'center', alignItems: 'center' }}>
                        {question.IsExpanded && <IconButton icon='pencil' size={24} style={{ margin: 0 }} />}
                      </View>)
                  }}
                />
                {question.IsExpanded &&
                  <Card.Content>
                    <Card>
                      <Card.Content style={{ paddingLeft: 12, paddingTop: 12, paddingBottom: 0, paddingRight: 0 }}>
                        <View style={{ flexDirection: 'row' }}>
                          <View style={{ maxWidth: '75%' }}>
                            <Text variant='bodyLarge'>
                              {question.Question}
                            </Text>
                          </View>
                          <IconButton icon='pencil' size={18} style={{ marginLeft: 'auto', margin: 0, alignSelf: 'center' }} />
                        </View>
                        {question.Answers.map((answer, answerIdx) => {
                          return (
                            <View key={answerIdx} style={{ flexDirection: 'row' }}>
                              <Checkbox.Item
                                style={{ paddingLeft: 0, paddingVertical: 0 }}
                                status={answer.IsSelected ? 'checked' : 'unchecked'}
                                position='leading'
                                onPress={() => toggleSelectAnswer(questionIdx, answerIdx)}
                                label={answer.Answer}
                                labelVariant='bodyMedium'
                                labelStyle={{ textAlign: 'left' }} />
                              <View style={{ flexDirection: 'row', marginLeft: 'auto', justifyContent: 'center', alignItems: 'center' }}>
                                <IconButton icon='pencil' size={18} style={{ margin: 0 }} />
                              </View>
                            </View>
                          )
                        })}
                        {question.IsExpanded &&
                          <Card.Actions>
                            <Button
                              icon="plus"
                              mode="outlined"
                              style={styles.button}>
                              Answer
                            </Button>
                          </Card.Actions>
                        }
                      </Card.Content>
                    </Card>
                  </Card.Content>
                }
              </Card>
            )
          })}
        </View>
      </Card.Content>
      <Card.Actions>
        <Button
          icon="plus"
          mode="outlined"
          style={styles.button}>
          Topic
        </Button>
      </Card.Actions>
    </Card>
  )
}

export default ActivityFaq