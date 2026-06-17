import React from 'react'
import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#05070b',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
  },
  kicker: {
    fontSize: 10,
    color: '#56d9ff',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    color: '#f4f7fb',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#a9b5c7',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#56d9ff',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#0e1520',
    padding: 20,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardTitle: {
    fontSize: 16,
    color: '#f4f7fb',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  cardText: {
    fontSize: 11,
    color: '#a9b5c7',
    lineHeight: 1.6,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  scoreBox: {
    flex: 1,
    backgroundColor: '#0e1520',
    padding: 20,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  scoreBoxLast: {
    marginRight: 0,
    marginLeft: 10,
  },
  scoreLabel: {
    fontSize: 9,
    color: '#8091ab',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    color: '#56d9ff',
    fontWeight: 'bold',
  },
  scoreDescription: {
    fontSize: 10,
    color: '#a9b5c7',
    marginTop: 8,
    textAlign: 'center',
  },
  recommendation: {
    backgroundColor: '#131c29',
    padding: 20,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#56d9ff',
  },
  recommendationTitle: {
    fontSize: 12,
    color: '#56d9ff',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  recommendationText: {
    fontSize: 11,
    color: '#f4f7fb',
    lineHeight: 1.6,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#8091ab',
  },
  footerBrand: {
    fontSize: 12,
    color: '#f4f7fb',
    fontWeight: 'bold',
  },
})

interface AssessmentReportProps {
  name: string
  score: number
  priorityLevel: string
  priorityDescription: string
  recommendation: string
  answers: Record<string, string | string[]>
  questions: Array<{
    key: string
    prompt: string
    options?: Array<{ value: string; label: string }>
  }>
  calUrl?: string
}

const AssessmentReport: React.FC<AssessmentReportProps> = ({
  name,
  score,
  priorityLevel,
  priorityDescription,
  recommendation,
  calUrl,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.kicker}>EMVY Mini AI Strategy Assessment</Text>
          <Text style={styles.title}>Your Ops Efficiency Report</Text>
          <Text style={styles.subtitle}>Prepared for {name}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Results</Text>
          <View style={styles.scoreContainer}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>Your Score</Text>
              <Text style={styles.scoreValue}>{score}</Text>
              <Text style={styles.scoreDescription}>Based on operational efficiency</Text>
            </View>
            <View style={[styles.scoreBox, styles.scoreBoxLast]}>
              <Text style={styles.scoreLabel}>Priority Level</Text>
              <Text style={styles.scoreValue}>{priorityLevel}</Text>
              <Text style={styles.scoreDescription}>Recommended next steps</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{priorityLevel}</Text>
            <Text style={styles.cardText}>{priorityDescription}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Next Steps</Text>
          <View style={styles.recommendation}>
            <Text style={styles.recommendationTitle}>What We Recommend</Text>
            <Text style={styles.recommendationText}>{recommendation}</Text>
          </View>
          {calUrl && (
            <View style={[styles.recommendation, { marginTop: 12 }]}>
              <Text style={styles.recommendationTitle}>Book Your Discovery Call</Text>
              <Link src={calUrl} style={styles.recommendationText}>
                Click here to book a 15-minute call
              </Link>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>emvy.ai</Text>
          <Text style={styles.footerBrand}>emvy.ai</Text>
        </View>
      </Page>
    </Document>
  )
}

export default AssessmentReport
