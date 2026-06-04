import React from 'react'
import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#05070b',
    fontFamily: 'Helvetica',
  },
  header: { marginBottom: 24 },
  kicker: {
    fontSize: 10,
    color: '#56d9ff',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: { fontSize: 28, color: '#f4f7fb', fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 12, color: '#a9b5c7' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 20 },
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
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardTitle: { fontSize: 14, color: '#f4f7fb', marginBottom: 6, fontWeight: 'bold' },
  cardText: { fontSize: 11, color: '#a9b5c7', lineHeight: 1.6 },
  metric: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#0e1520',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  metricLabel: {
    fontSize: 9,
    color: '#8091ab',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  metricValue: { fontSize: 18, color: '#f4f7fb', fontWeight: 'bold' },
  list: { marginTop: 8 },
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  bullet: { color: '#56d9ff', marginRight: 8, fontSize: 11 },
  listText: { fontSize: 11, color: '#f4f7fb', lineHeight: 1.5, flex: 1 },
  phaseRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  phaseBadge: {
    backgroundColor: '#131c29',
    color: '#56d9ff',
    fontSize: 9,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  phaseBody: { fontSize: 11, color: '#f4f7fb', lineHeight: 1.5, marginTop: 4 },
  investmentBox: {
    backgroundColor: '#131c29',
    padding: 18,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2be3a3',
    marginTop: 8,
  },
  investmentTitle: {
    fontSize: 11,
    color: '#2be3a3',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  investmentText: { fontSize: 11, color: '#f4f7fb', lineHeight: 1.6 },
  ctaBox: {
    backgroundColor: '#56d9ff',
    padding: 18,
    borderRadius: 8,
    marginTop: 12,
  },
  ctaTitle: { fontSize: 12, color: '#05070b', fontWeight: 'bold', marginBottom: 6 },
  ctaText: { fontSize: 11, color: '#05070b', lineHeight: 1.5 },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: { fontSize: 9, color: '#8091ab' },
})

export interface AuditFinding {
  title: string
  description: string
}

export interface AuditPlan {
  phase: string
  title: string
  description: string
}

export interface AuditReportProps {
  companyName: string
  contactName?: string
  preparedFor?: string
  preparedBy?: string
  date?: string
  summary: string
  findings: AuditFinding[]
  metrics: { label: string; value: string }[]
  plan: AuditPlan[]
  investment: { range: string; structure: string; notes?: string }
  nextStepUrl: string
  nextStepLabel: string
}

const AuditReport: React.FC<AuditReportProps> = ({
  companyName,
  contactName,
  preparedFor,
  date,
  summary,
  findings,
  metrics,
  plan,
  investment,
  nextStepUrl,
  nextStepLabel,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.kicker}>EMVY Operations Audit</Text>
          <Text style={styles.title}>{companyName}</Text>
          <Text style={styles.subtitle}>
            {preparedFor ?? contactName ?? 'Operations audit deliverable'}
            {date ? ` · ${date}` : ''}
          </Text>
        </View>

        <View style={styles.divider} />

        <View>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>{summary}</Text>
          </View>
        </View>

        {metrics.length > 0 ? (
          <View style={{ marginTop: 18 }}>
            <Text style={styles.sectionTitle}>Where the time goes</Text>
            <View style={styles.metric}>
              {metrics.slice(0, 4).map((m) => (
                <View key={m.label} style={styles.metricBox}>
                  <Text style={styles.metricLabel}>{m.label}</Text>
                  <Text style={styles.metricValue}>{m.value}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={{ marginTop: 18 }}>
          <Text style={styles.sectionTitle}>Key Findings</Text>
          {findings.map((f) => (
            <View key={f.title} style={styles.card}>
              <Text style={styles.cardTitle}>{f.title}</Text>
              <Text style={styles.cardText}>{f.description}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 18 }}>
          <Text style={styles.sectionTitle}>Recommended 90-Day Plan</Text>
          {plan.map((p) => (
            <View key={p.phase + p.title} style={styles.card}>
              <View style={styles.phaseRow}>
                <Text style={styles.phaseBadge}>{p.phase}</Text>
                <Text style={styles.cardTitle}>{p.title}</Text>
              </View>
              <Text style={styles.phaseBody}>{p.description}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 18 }}>
          <Text style={styles.sectionTitle}>Investment</Text>
          <View style={styles.investmentBox}>
            <Text style={styles.investmentTitle}>Indicative range</Text>
            <Text style={styles.investmentText}>{investment.range}</Text>
            <Text style={styles.investmentText}>{investment.structure}</Text>
            {investment.notes ? (
              <Text style={[styles.investmentText, { marginTop: 6 }]}>
                {investment.notes}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={{ marginTop: 18 }}>
          <View style={styles.ctaBox}>
            <Text style={styles.ctaTitle}>Next step</Text>
            <Link src={nextStepUrl} style={styles.ctaText}>
              {nextStepLabel}
            </Link>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>emvy.ai · Audit deliverable</Text>
          <Text style={styles.footerText}>Confidential</Text>
        </View>
      </Page>
    </Document>
  )
}

export default AuditReport
