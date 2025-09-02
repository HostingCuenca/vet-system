import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Register fonts if needed
// Font.register({
//   family: 'Roboto',
//   src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
// });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontSize: 10,
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 20,
    borderBottom: '2pt solid #2563eb',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center' as const,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center' as const,
  },
  section: {
    marginBottom: 15,
    padding: 10,
    border: '1pt solid #e5e7eb',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    backgroundColor: '#f3f4f6',
    padding: 5,
    borderRadius: 3,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#4b5563',
    width: '30%',
    marginRight: 10,
  },
  value: {
    fontSize: 9,
    color: '#1f2937',
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 5,
  },
  prescriptionItem: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f9fafb',
    border: '1pt solid #e5e7eb',
    borderRadius: 3,
  },
  textArea: {
    fontSize: 9,
    color: '#1f2937',
    minHeight: 30,
    border: '1pt solid #e5e7eb',
    padding: 5,
    borderRadius: 3,
    backgroundColor: '#fafafa',
  },
})

interface MedicalRecordPDFProps {
  record: any // We'll type this properly later
}

const MedicalRecordPDF: React.FC<MedicalRecordPDFProps> = ({ record }) => {
  const formatDate = (date: Date | string | null) => {
    if (!date) return 'No especificado'
    try {
      const d = new Date(date)
      return d.toLocaleDateString('es-ES')
    } catch (e) {
      return 'Fecha inválida'
    }
  }

  const formatTime = (time: Date | string | null) => {
    if (!time) return 'No especificado'
    try {
      const d = new Date(time)
      return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return 'Hora inválida'
    }
  }

  // Verificar que tenemos los datos necesarios
  if (!record || !record.pet) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Error: No se encontraron datos de la ficha clínica</Text>
        </Page>
      </Document>
    )
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>FICHA CLÍNICA VETERINARIA</Text>
          <Text style={styles.subtitle}>Sistema Veterinario Digital</Text>
        </View>

        {/* Patient & Owner Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 INFORMACIÓN DEL PACIENTE</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>ID Interno:</Text>
                <Text style={styles.value}>{record.pet.internalId}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Nombre:</Text>
                <Text style={styles.value}>{record.pet.name}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Especie:</Text>
                <Text style={styles.value}>{record.pet.species}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Raza:</Text>
                <Text style={styles.value}>{record.pet.breed || 'No especificada'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Género:</Text>
                <Text style={styles.value}>{record.pet.gender}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Propietario:</Text>
                <Text style={styles.value}>{record.pet.owner.name}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Cédula:</Text>
                <Text style={styles.value}>{record.pet.owner.identificationNumber}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Teléfono:</Text>
                <Text style={styles.value}>{record.pet.owner.phone || 'No especificado'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{record.pet.owner.email || 'No especificado'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Dirección:</Text>
                <Text style={styles.value}>{record.pet.owner.address || 'No especificada'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Visit Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 INFORMACIÓN DE LA CONSULTA</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Fecha:</Text>
                <Text style={styles.value}>{formatDate(record.visitDate)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Hora:</Text>
                <Text style={styles.value}>{formatTime(record.visitTime)}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Veterinario:</Text>
                <Text style={styles.value}>{record.veterinarian.name}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Seguimiento:</Text>
                <Text style={styles.value}>{formatDate(record.followUpDate)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Motivo:</Text>
            <Text style={styles.value}>{record.reasonForVisit}</Text>
          </View>
        </View>

        {/* Clinical Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏥 DATOS CLÍNICOS</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Peso:</Text>
                <Text style={styles.value}>{record.weight ? `${record.weight} kg` : 'No registrado'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Temperatura:</Text>
                <Text style={styles.value}>{record.temperature ? `${record.temperature} °C` : 'No registrada'}</Text>
              </View>
            </View>
          </View>
          {record.symptoms && (
            <View>
              <Text style={styles.label}>Síntomas:</Text>
              <Text style={styles.textArea}>{record.symptoms}</Text>
            </View>
          )}
          {record.diagnosis && (
            <View>
              <Text style={styles.label}>Diagnóstico:</Text>
              <Text style={styles.textArea}>{record.diagnosis}</Text>
            </View>
          )}
          {record.treatment && (
            <View>
              <Text style={styles.label}>Tratamiento:</Text>
              <Text style={styles.textArea}>{record.treatment}</Text>
            </View>
          )}
          {record.notes && (
            <View>
              <Text style={styles.label}>Observaciones:</Text>
              <Text style={styles.textArea}>{record.notes}</Text>
            </View>
          )}
        </View>

        {/* Anamnesis */}
        {record.anamnesis && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔍 ANAMNESIS</Text>
            <View style={styles.grid}>
              {record.anamnesis.lastDewormingDate && (
                <View style={styles.gridItem}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Última desparasitación:</Text>
                    <Text style={styles.value}>{formatDate(record.anamnesis.lastDewormingDate)}</Text>
                  </View>
                </View>
              )}
              {record.anamnesis.reproductiveStatus && (
                <View style={styles.gridItem}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Estado reproductivo:</Text>
                    <Text style={styles.value}>{record.anamnesis.reproductiveStatus}</Text>
                  </View>
                </View>
              )}
            </View>
            {record.anamnesis.previousIllnesses && (
              <View>
                <Text style={styles.label}>Enfermedades previas:</Text>
                <Text style={styles.textArea}>{record.anamnesis.previousIllnesses}</Text>
              </View>
            )}
            {record.anamnesis.allergies && (
              <View>
                <Text style={styles.label}>Alergias:</Text>
                <Text style={styles.textArea}>{record.anamnesis.allergies}</Text>
              </View>
            )}
            {record.anamnesis.currentMedications && (
              <View>
                <Text style={styles.label}>Medicamentos actuales:</Text>
                <Text style={styles.textArea}>{record.anamnesis.currentMedications}</Text>
              </View>
            )}
          </View>
        )}

        {/* Vital Signs */}
        {record.vitalSigns && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💓 SIGNOS VITALES</Text>
            <View style={styles.grid}>
              {record.vitalSigns.heartRate && (
                <View style={styles.gridItem}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Frecuencia cardíaca:</Text>
                    <Text style={styles.value}>{record.vitalSigns.heartRate} lpm</Text>
                  </View>
                </View>
              )}
              {record.vitalSigns.respiratoryRate && (
                <View style={styles.gridItem}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Frecuencia respiratoria:</Text>
                    <Text style={styles.value}>{record.vitalSigns.respiratoryRate} rpm</Text>
                  </View>
                </View>
              )}
              {record.vitalSigns.temperature && (
                <View style={styles.gridItem}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Temperatura:</Text>
                    <Text style={styles.value}>{record.vitalSigns.temperature} °C</Text>
                  </View>
                </View>
              )}
              {record.vitalSigns.bodyConditionScore && (
                <View style={styles.gridItem}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Condición corporal:</Text>
                    <Text style={styles.value}>{record.vitalSigns.bodyConditionScore}/9</Text>
                  </View>
                </View>
              )}
              {record.vitalSigns.hydrationStatus && (
                <View style={styles.gridItem}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Estado de hidratación:</Text>
                    <Text style={styles.value}>{record.vitalSigns.hydrationStatus}</Text>
                  </View>
                </View>
              )}
              {record.vitalSigns.mentalStatus && (
                <View style={styles.gridItem}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Estado mental:</Text>
                    <Text style={styles.value}>{record.vitalSigns.mentalStatus}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Systems Review */}
        {record.systemsReview && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔬 REVISIÓN POR SISTEMAS</Text>
            {record.systemsReview.skinCondition && (
              <View>
                <Text style={styles.label}>Sistema tegumentario:</Text>
                <Text style={styles.textArea}>{record.systemsReview.skinCondition}</Text>
              </View>
            )}
            {record.systemsReview.respiratorySystem && (
              <View>
                <Text style={styles.label}>Sistema respiratorio:</Text>
                <Text style={styles.textArea}>{record.systemsReview.respiratorySystem}</Text>
              </View>
            )}
            {record.systemsReview.digestiveSystem && (
              <View>
                <Text style={styles.label}>Sistema digestivo:</Text>
                <Text style={styles.textArea}>{record.systemsReview.digestiveSystem}</Text>
              </View>
            )}
            {record.systemsReview.nervousSystem && (
              <View>
                <Text style={styles.label}>Sistema nervioso:</Text>
                <Text style={styles.textArea}>{record.systemsReview.nervousSystem}</Text>
              </View>
            )}
          </View>
        )}

        {/* Prescriptions */}
        {record.prescriptions && record.prescriptions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💊 PRESCRIPCIONES</Text>
            {record.prescriptions.map((prescription: any, index: number) => (
              <View key={index} style={styles.prescriptionItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>Producto:</Text>
                  <Text style={styles.value}>{prescription.product.name}</Text>
                </View>
                <View style={styles.grid}>
                  <View style={styles.gridItem}>
                    <View style={styles.row}>
                      <Text style={styles.label}>Cantidad:</Text>
                      <Text style={styles.value}>{prescription.quantity} {prescription.product.unitType}</Text>
                    </View>
                  </View>
                  <View style={styles.gridItem}>
                    <View style={styles.row}>
                      <Text style={styles.label}>Dosis:</Text>
                      <Text style={styles.value}>{prescription.dosage}</Text>
                    </View>
                  </View>
                </View>
                {prescription.frequency && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Frecuencia:</Text>
                    <Text style={styles.value}>{prescription.frequency}</Text>
                  </View>
                )}
                {prescription.duration && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Duración:</Text>
                    <Text style={styles.value}>{prescription.duration}</Text>
                  </View>
                )}
                {prescription.instructions && (
                  <View>
                    <Text style={styles.label}>Instrucciones:</Text>
                    <Text style={styles.textArea}>{prescription.instructions}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={{ marginTop: 20, paddingTop: 10, borderTop: '1pt solid #e5e7eb' }}>
          <Text style={{ fontSize: 8, color: '#6b7280', textAlign: 'center' as const }}>
            Ficha clínica generada el {new Date().toLocaleDateString('es-ES')} - Sistema Veterinario Digital
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export default MedicalRecordPDF