import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pdf } from '@react-pdf/renderer'
import React from 'react'
import MedicalRecordPDF from './MedicalRecordPDF'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id } = await params
    
    // Optimized query - get all data in one call
    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        visitDate: true,
        visitTime: true,
        reasonForVisit: true,
        symptoms: true,
        diagnosis: true,
        treatment: true,
        weight: true,
        temperature: true,
        notes: true,
        followUpDate: true,
        pet: {
          select: {
            id: true,
            name: true,
            internalId: true,
            species: true,
            breed: true,
            gender: true,
            birthDate: true,
            currentWeight: true,
            microchip: true,
            color: true,
            owner: {
              select: {
                name: true,
                identificationNumber: true,
                phone: true,
                address: true,
                email: true,
              }
            }
          }
        },
        veterinarian: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        prescriptions: {
          select: {
            id: true,
            quantity: true,
            dosage: true,
            frequency: true,
            duration: true,
            instructions: true,
            startDate: true,
            endDate: true,
            product: {
              select: {
                name: true,
                unitType: true,
                category: true,
              }
            }
          }
        },
        anamnesis: {
          select: {
            lastDewormingDate: true,
            dewormingFrequency: true,
            dewormingProducts: true,
            previousIllnesses: true,
            chronicConditions: true,
            allergies: true,
            surgicalHistory: true,
            previousTreatments: true,
            currentMedications: true,
            feedType: true,
            feedBrand: true,
            feedingSchedule: true,
            specialDiet: true,
            dietDetails: true,
            appetiteChanges: true,
            reproductiveStatus: true,
            castrationDate: true,
            lastHeatDate: true,
            pregnancyHistory: true,
            lastBirthDate: true,
            behaviorChanges: true,
            activityLevel: true,
            exerciseRoutine: true,
            sleepPatterns: true,
            housingType: true,
            outdoorAccess: true,
            otherPets: true,
            lastVetVisit: true,
            reasonLastVisit: true,
          }
        },
        vitalSigns: {
          select: {
            heartRate: true,
            respiratoryRate: true,
            temperature: true,
            weight: true,
            bodyConditionScore: true,
            hydrationStatus: true,
            mentalStatus: true,
            postureGait: true,
            heartSounds: true,
            pulseQuality: true,
            mucousMembranes: true,
            capillaryRefillTime: true,
            lymphNodes: true,
            lymphNodeDetails: true,
            alertness: true,
            temperament: true,
            painLevel: true,
          }
        },
        systemsReview: {
          select: {
            skinCondition: true,
            skinFindings: true,
            coatQuality: true,
            skinLesions: true,
            respiratorySystem: true,
            lungSounds: true,
            breathingPattern: true,
            coughPresent: true,
            nasalDischarge: true,
            digestiveSystem: true,
            oralExamination: true,
            abdominalPalpation: true,
            intestinalSounds: true,
            genitourinarySystem: true,
            kidneyPalpation: true,
            bladderPalpation: true,
            genitalExamination: true,
            urination: true,
            musculoskeletalSystem: true,
            jointMobility: true,
            muscleCondition: true,
            gaitAssessment: true,
            spinalPalpation: true,
            nervousSystem: true,
            mentalState: true,
            reflexesAssessment: true,
            coordinationTest: true,
            eyeExamination: true,
            earExamination: true,
            generalObservations: true,
            additionalFindings: true,
          }
        },
      }
    })

    if (!medicalRecord) {
      return NextResponse.json(
        { error: 'Ficha clínica no encontrada' },
        { status: 404 }
      )
    }

    // Generate PDF buffer
    try {
      console.log('Generating PDF for record:', medicalRecord.id)
      
      const pdfDoc = pdf(React.createElement(MedicalRecordPDF, { record: medicalRecord }))
      
      // Use a different approach to get the buffer
      const chunks: Buffer[] = []
      const stream = await pdfDoc.toBlob()
      
      // Convert blob to buffer
      const arrayBuffer = await stream.arrayBuffer()
      const pdfBuffer = Buffer.from(arrayBuffer)
      
      console.log('PDF generated successfully, size:', pdfBuffer.length)
      
      // Generate filename
      const filename = `Ficha_Clinica_${medicalRecord.pet.internalId}_${medicalRecord.visitDate.toISOString().split('T')[0]}.pdf`
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': pdfBuffer.length.toString(),
        },
      })
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError)
      return NextResponse.json(
        { error: 'Error generando el PDF: ' + (pdfError as Error).message },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}