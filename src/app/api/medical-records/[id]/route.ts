import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        pet: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                identificationNumber: true,
                phone: true,
                email: true,
                address: true,
              }
            }
          }
        },
        veterinarian: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        },
        prescriptions: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unitType: true,
                unitPrice: true,
              }
            }
          }
        },
        anamnesis: true,
        vitalSigns: true,
        systemsReview: true,
      }
    })

    if (!medicalRecord) {
      return NextResponse.json(
        { error: 'Registro médico no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(medicalRecord)

  } catch (error) {
    console.error('Error fetching medical record:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { 
      reasonForVisit,
      symptoms,
      diagnosis,
      treatment,
      weight,
      temperature,
      notes,
      followUpDate,
      // Datos de anamnesis
      anamnesis,
      // Datos de signos vitales
      vitalSigns,
      // Datos de revisión por sistemas
      systemsReview,
      // Prescripciones
      prescriptions = []
    } = body

    // Verificar que el registro médico existe
    const existingRecord = await prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        pet: true,
        anamnesis: true,
        vitalSigns: true,
        systemsReview: true,
        prescriptions: true,
      }
    })

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Registro médico no encontrado' },
        { status: 404 }
      )
    }

    // Validaciones básicas
    if (!reasonForVisit) {
      return NextResponse.json(
        { error: 'Motivo de consulta es requerido' },
        { status: 400 }
      )
    }

    // Actualizar usando transacción
    const result = await prisma.$transaction(async (tx) => {
      // 1. Actualizar MedicalRecord principal
      const updatedRecord = await tx.medicalRecord.update({
        where: { id },
        data: {
          reasonForVisit: reasonForVisit.trim(),
          symptoms: symptoms?.trim() || null,
          diagnosis: diagnosis?.trim() || null,
          treatment: treatment?.trim() || null,
          weight: weight ? parseFloat(weight) : null,
          temperature: temperature ? parseFloat(temperature) : null,
          notes: notes?.trim() || null,
          followUpDate: followUpDate ? new Date(followUpDate) : null,
        }
      })

      // 2. Actualizar o crear Anamnesis
      if (anamnesis && Object.keys(anamnesis).length > 0) {
        if (existingRecord.anamnesis) {
          await tx.anamnesis.update({
            where: { medicalRecordId: id },
            data: {
              lastDewormingDate: anamnesis.lastDewormingDate ? new Date(anamnesis.lastDewormingDate) : null,
              dewormingFrequency: anamnesis.dewormingFrequency?.trim() || null,
              dewormingProducts: anamnesis.dewormingProducts?.trim() || null,
              previousIllnesses: anamnesis.previousIllnesses?.trim() || null,
              chronicConditions: anamnesis.chronicConditions?.trim() || null,
              allergies: anamnesis.allergies?.trim() || null,
              surgicalHistory: anamnesis.surgicalHistory?.trim() || null,
              previousTreatments: anamnesis.previousTreatments?.trim() || null,
              currentMedications: anamnesis.currentMedications?.trim() || null,
              feedType: anamnesis.feedType?.trim() || null,
              feedBrand: anamnesis.feedBrand?.trim() || null,
              feedingSchedule: anamnesis.feedingSchedule?.trim() || null,
              specialDiet: anamnesis.specialDiet || false,
              dietDetails: anamnesis.dietDetails?.trim() || null,
              appetiteChanges: anamnesis.appetiteChanges?.trim() || null,
              reproductiveStatus: anamnesis.reproductiveStatus?.trim() || null,
              castrationDate: anamnesis.castrationDate ? new Date(anamnesis.castrationDate) : null,
              lastHeatDate: anamnesis.lastHeatDate ? new Date(anamnesis.lastHeatDate) : null,
              pregnancyHistory: anamnesis.pregnancyHistory ? parseInt(anamnesis.pregnancyHistory) : 0,
              lastBirthDate: anamnesis.lastBirthDate ? new Date(anamnesis.lastBirthDate) : null,
              behaviorChanges: anamnesis.behaviorChanges?.trim() || null,
              activityLevel: anamnesis.activityLevel?.trim() || null,
              exerciseRoutine: anamnesis.exerciseRoutine?.trim() || null,
              sleepPatterns: anamnesis.sleepPatterns?.trim() || null,
              housingType: anamnesis.housingType?.trim() || null,
              outdoorAccess: anamnesis.outdoorAccess || false,
              otherPets: anamnesis.otherPets?.trim() || null,
              lastVetVisit: anamnesis.lastVetVisit ? new Date(anamnesis.lastVetVisit) : null,
              reasonLastVisit: anamnesis.reasonLastVisit?.trim() || null,
            }
          })
        } else {
          await tx.anamnesis.create({
            data: {
              medicalRecordId: id,
              // ... mismos campos que en el POST
              lastDewormingDate: anamnesis.lastDewormingDate ? new Date(anamnesis.lastDewormingDate) : null,
              dewormingFrequency: anamnesis.dewormingFrequency?.trim() || null,
              dewormingProducts: anamnesis.dewormingProducts?.trim() || null,
              previousIllnesses: anamnesis.previousIllnesses?.trim() || null,
              chronicConditions: anamnesis.chronicConditions?.trim() || null,
              allergies: anamnesis.allergies?.trim() || null,
              surgicalHistory: anamnesis.surgicalHistory?.trim() || null,
              previousTreatments: anamnesis.previousTreatments?.trim() || null,
              currentMedications: anamnesis.currentMedications?.trim() || null,
              feedType: anamnesis.feedType?.trim() || null,
              feedBrand: anamnesis.feedBrand?.trim() || null,
              feedingSchedule: anamnesis.feedingSchedule?.trim() || null,
              specialDiet: anamnesis.specialDiet || false,
              dietDetails: anamnesis.dietDetails?.trim() || null,
              appetiteChanges: anamnesis.appetiteChanges?.trim() || null,
              reproductiveStatus: anamnesis.reproductiveStatus?.trim() || null,
              castrationDate: anamnesis.castrationDate ? new Date(anamnesis.castrationDate) : null,
              lastHeatDate: anamnesis.lastHeatDate ? new Date(anamnesis.lastHeatDate) : null,
              pregnancyHistory: anamnesis.pregnancyHistory ? parseInt(anamnesis.pregnancyHistory) : 0,
              lastBirthDate: anamnesis.lastBirthDate ? new Date(anamnesis.lastBirthDate) : null,
              behaviorChanges: anamnesis.behaviorChanges?.trim() || null,
              activityLevel: anamnesis.activityLevel?.trim() || null,
              exerciseRoutine: anamnesis.exerciseRoutine?.trim() || null,
              sleepPatterns: anamnesis.sleepPatterns?.trim() || null,
              housingType: anamnesis.housingType?.trim() || null,
              outdoorAccess: anamnesis.outdoorAccess || false,
              otherPets: anamnesis.otherPets?.trim() || null,
              lastVetVisit: anamnesis.lastVetVisit ? new Date(anamnesis.lastVetVisit) : null,
              reasonLastVisit: anamnesis.reasonLastVisit?.trim() || null,
            }
          })
        }
      }

      // 3. Actualizar o crear VitalSigns
      if (vitalSigns && Object.keys(vitalSigns).length > 0) {
        if (existingRecord.vitalSigns) {
          await tx.vitalSigns.update({
            where: { medicalRecordId: id },
            data: {
              heartRate: vitalSigns.heartRate ? parseInt(vitalSigns.heartRate) : null,
              respiratoryRate: vitalSigns.respiratoryRate ? parseInt(vitalSigns.respiratoryRate) : null,
              temperature: vitalSigns.temperature ? parseFloat(vitalSigns.temperature) : null,
              weight: vitalSigns.weight ? parseFloat(vitalSigns.weight) : null,
              bodyConditionScore: vitalSigns.bodyConditionScore ? parseInt(vitalSigns.bodyConditionScore) : null,
              hydrationStatus: vitalSigns.hydrationStatus?.trim() || null,
              mentalStatus: vitalSigns.mentalStatus?.trim() || null,
              postureGait: vitalSigns.postureGait?.trim() || null,
              heartSounds: vitalSigns.heartSounds?.trim() || null,
              pulseQuality: vitalSigns.pulseQuality?.trim() || null,
              mucousMembranes: vitalSigns.mucousMembranes?.trim() || null,
              capillaryRefillTime: vitalSigns.capillaryRefillTime?.trim() || null,
              lymphNodes: vitalSigns.lymphNodes?.trim() || null,
              lymphNodeDetails: vitalSigns.lymphNodeDetails?.trim() || null,
              alertness: vitalSigns.alertness?.trim() || null,
              temperament: vitalSigns.temperament?.trim() || null,
              painLevel: vitalSigns.painLevel?.trim() || null,
            }
          })
        } else {
          await tx.vitalSigns.create({
            data: {
              medicalRecordId: id,
              heartRate: vitalSigns.heartRate ? parseInt(vitalSigns.heartRate) : null,
              respiratoryRate: vitalSigns.respiratoryRate ? parseInt(vitalSigns.respiratoryRate) : null,
              temperature: vitalSigns.temperature ? parseFloat(vitalSigns.temperature) : null,
              weight: vitalSigns.weight ? parseFloat(vitalSigns.weight) : null,
              bodyConditionScore: vitalSigns.bodyConditionScore ? parseInt(vitalSigns.bodyConditionScore) : null,
              hydrationStatus: vitalSigns.hydrationStatus?.trim() || null,
              mentalStatus: vitalSigns.mentalStatus?.trim() || null,
              postureGait: vitalSigns.postureGait?.trim() || null,
              heartSounds: vitalSigns.heartSounds?.trim() || null,
              pulseQuality: vitalSigns.pulseQuality?.trim() || null,
              mucousMembranes: vitalSigns.mucousMembranes?.trim() || null,
              capillaryRefillTime: vitalSigns.capillaryRefillTime?.trim() || null,
              lymphNodes: vitalSigns.lymphNodes?.trim() || null,
              lymphNodeDetails: vitalSigns.lymphNodeDetails?.trim() || null,
              alertness: vitalSigns.alertness?.trim() || null,
              temperament: vitalSigns.temperament?.trim() || null,
              painLevel: vitalSigns.painLevel?.trim() || null,
            }
          })
        }
      }

      // 4. Actualizar o crear SystemsReview (similar a VitalSigns)
      if (systemsReview && Object.keys(systemsReview).length > 0) {
        const systemsData = {
          skinCondition: systemsReview.skinCondition?.trim() || null,
          skinFindings: systemsReview.skinFindings?.trim() || null,
          coatQuality: systemsReview.coatQuality?.trim() || null,
          skinLesions: systemsReview.skinLesions?.trim() || null,
          respiratorySystem: systemsReview.respiratorySystem?.trim() || null,
          lungSounds: systemsReview.lungSounds?.trim() || null,
          breathingPattern: systemsReview.breathingPattern?.trim() || null,
          coughPresent: systemsReview.coughPresent || false,
          nasalDischarge: systemsReview.nasalDischarge?.trim() || null,
          digestiveSystem: systemsReview.digestiveSystem?.trim() || null,
          oralExamination: systemsReview.oralExamination?.trim() || null,
          abdominalPalpation: systemsReview.abdominalPalpation?.trim() || null,
          intestinalSounds: systemsReview.intestinalSounds?.trim() || null,
          genitourinarySystem: systemsReview.genitourinarySystem?.trim() || null,
          kidneyPalpation: systemsReview.kidneyPalpation?.trim() || null,
          bladderPalpation: systemsReview.bladderPalpation?.trim() || null,
          genitalExamination: systemsReview.genitalExamination?.trim() || null,
          urination: systemsReview.urination?.trim() || null,
          musculoskeletalSystem: systemsReview.musculoskeletalSystem?.trim() || null,
          jointMobility: systemsReview.jointMobility?.trim() || null,
          muscleCondition: systemsReview.muscleCondition?.trim() || null,
          gaitAssessment: systemsReview.gaitAssessment?.trim() || null,
          spinalPalpation: systemsReview.spinalPalpation?.trim() || null,
          nervousSystem: systemsReview.nervousSystem?.trim() || null,
          mentalState: systemsReview.mentalState?.trim() || null,
          reflexesAssessment: systemsReview.reflexesAssessment?.trim() || null,
          coordinationTest: systemsReview.coordinationTest?.trim() || null,
          eyeExamination: systemsReview.eyeExamination?.trim() || null,
          earExamination: systemsReview.earExamination?.trim() || null,
          generalObservations: systemsReview.generalObservations?.trim() || null,
          additionalFindings: systemsReview.additionalFindings?.trim() || null,
        }

        if (existingRecord.systemsReview) {
          await tx.systemsReview.update({
            where: { medicalRecordId: id },
            data: systemsData
          })
        } else {
          await tx.systemsReview.create({
            data: {
              medicalRecordId: id,
              ...systemsData
            }
          })
        }
      }

      // 5. Actualizar peso de la mascota si cambió
      if (weight && parseFloat(weight) !== existingRecord.pet.currentWeight) {
        await tx.pet.update({
          where: { id: existingRecord.petId },
          data: { currentWeight: parseFloat(weight) }
        })

        // Crear registro en historial de pesos
        await tx.petWeight.create({
          data: {
            petId: existingRecord.petId,
            weight: parseFloat(weight),
            measurementDate: existingRecord.visitDate,
            recordedBy: existingRecord.veterinarianId,
            notes: 'Peso actualizado durante consulta médica'
          }
        })
      }

      return updatedRecord
    })

    // Devolver el registro completo actualizado
    const fullRecord = await prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        pet: {
          include: {
            owner: true
          }
        },
        veterinarian: {
          select: {
            id: true,
            name: true,
          }
        },
        prescriptions: {
          include: {
            product: {
              select: {
                name: true,
                unitType: true,
              }
            }
          }
        },
        anamnesis: true,
        vitalSigns: true,
        systemsReview: true,
      }
    })

    return NextResponse.json(fullRecord)

  } catch (error) {
    console.error('Error updating medical record:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    // Verificar que el registro médico existe
    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: { id },
      select: {
        id: true,
        pet: {
          select: { name: true, internalId: true }
        },
        visitDate: true,
      }
    })

    if (!medicalRecord) {
      return NextResponse.json(
        { error: 'Registro médico no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el registro médico (cascade eliminará anamnesis, vitalSigns, systemsReview automáticamente)
    await prisma.medicalRecord.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Registro médico eliminado exitosamente',
      petName: medicalRecord.pet.name,
      petId: medicalRecord.pet.internalId,
      visitDate: medicalRecord.visitDate
    })

  } catch (error) {
    console.error('Error deleting medical record:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}