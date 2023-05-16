import React, { useState } from 'react'
import { View } from 'react-native'
import { Button, Card, Checkbox, IconButton, Switch, Text, TouchableRipple, useTheme } from 'react-native-paper'
import { FaqModel } from './Models'
import styles from './Styles'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

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

function stateFromCompletion(faqCompletion: FaqModel): FaqState {
  const questions: Array<QuestionState> = []
  for (const question of faqCompletion.Questions) {
    const answers: Array<AnswerState> = []
    for (const answer of question.Answers) {
      answers.push({
        Answer: answer,
      })
    }
    questions.push({
      Topic: question.Topic,
      Question: question.Question,
      Answers: answers,
      IsSelected: answers.map((answer) => answer.IsSelected).reduce((p, c) => p || c),
    })
  }
  return { Questions: questions }
}

const ActivityFaq = (props: ActivityFaqProps): JSX.Element => {
  const [faqState, setFaqState] = useState<FaqState>(stateFromCompletion(props.faq))

  const theme = useTheme()

  function toggleExpandQuestion(questionIdx: number) {
    const questions: Array<QuestionState> = []
    faqState.Questions.forEach((q, i) => {
      questions.push({
        ...q,
        IsExpanded: (i === questionIdx) ? !q.IsExpanded : q.IsExpanded,
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
                  titleStyle={{ paddingTop: 3 }}
                  left={() => <IconButton mode='contained' icon={question.IsExpanded ? 'minus' : 'plus'} size={20} onPress={() => toggleExpandQuestion(questionIdx)} />}
                  right={() => {
                    return (
                      <View style={{ flexDirection: 'row', marginLeft: 'auto', justifyContent: 'center', alignItems: 'center' }}>
                        {question.IsExpanded && <IconButton icon='pencil' size={24} style={{ margin: 0 }} />}
                        {question.IsExpanded && <IconButton icon='delete' size={24} style={{ margin: 0 }} />}
                      </View>)
                  }}
                />
                {question.IsExpanded &&
                  <Card.Content>
                    <Text variant='bodyLarge' style={styles.text}>
                      {question.Question}
                    </Text>
                    {question.Answers.map((answer, answerIdx) => {
                      return (
                        <View key={answerIdx} style={{ flexDirection: 'row' }}>
                          <Checkbox.Item
                            status={answer.IsSelected ? 'checked' : 'unchecked'}
                            position='leading'
                            onPress={() => toggleSelectAnswer(questionIdx, answerIdx)}
                            label={answer.Answer}
                            labelVariant='bodySmall'
                            labelStyle={{ flexGrow: 1, alignSelf: 'center', marginBottom: 0 }} />
                          <View style={{ flexDirection: 'row', marginLeft: 'auto', justifyContent: 'center', alignItems: 'center' }}>
                            <IconButton icon='pencil' size={18} />
                            <IconButton icon='delete' size={18} />
                          </View>
                        </View>
                      )
                    })}
                  </Card.Content>
                }
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