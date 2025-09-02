import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const medicalRecords = await prisma.medicalRecord.findMany({
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            internalId: true,
            species: true,
            breed: true,
            owner: {
              select: {
                name: true,
                identificationNumber: true,
              }
            }
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
      },
      orderBy: {
        visitDate: 'desc'
      }
    })

    return NextResponse.json(medicalRecords)

  } catch (error) {
    console.error('Error fetching medical records:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      petId, 
      veterinarianId,
      visitDate,
      visitTime,
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

    // Validaciones básicas
    if (!petId || !veterinarianId || !visitDate || !reasonForVisit) {
      return NextResponse.json(
        { error: 'Pet, veterinario, fecha y motivo de consulta son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que la mascota existe
    const pet = await prisma.pet.findUnique({
      where: { id: parseInt(petId) }
    })

    if (!pet) {
      return NextResponse.json(
        { error: 'La mascota no existe' },
        { status: 400 }
      )
    }

    // Verificar que el veterinario existe
    const veterinarian = await prisma.user.findFirst({
      where: { 
        id: parseInt(veterinarianId),
        role: 'VETERINARIAN'
      }
    })

    if (!veterinarian) {
      return NextResponse.json(
        { error: 'El veterinario no existe o no tiene permisos' },
        { status: 400 }
      )
    }

    // Crear el registro médico completo usando transacción
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear MedicalRecord principal
      const medicalRecord = await tx.medicalRecord.create({
        data: {
          petId: parseInt(petId),
          veterinarianId: parseInt(veterinarianId),
          visitDate: new Date(visitDate),
          visitTime: visitTime ? new Date(`1970-01-01T${visitTime}:00.000Z`) : null,
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

      // 2. Crear Anamnesis si se proporciona
      if (anamnesis && Object.keys(anamnesis).length > 0) {
        await tx.anamnesis.create({
          data: {
            medicalRecordId: medicalRecord.id,
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

      // 3. Crear VitalSigns si se proporciona
      if (vitalSigns && Object.keys(vitalSigns).length > 0) {
        await tx.vitalSigns.create({
          data: {
            medicalRecordId: medicalRecord.id,
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

      // 4. Crear SystemsReview si se proporciona
      if (systemsReview && Object.keys(systemsReview).length > 0) {
        await tx.systemsReview.create({
          data: {
            medicalRecordId: medicalRecord.id,
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
        })
      }

      // 5. Crear prescripciones si se proporcionan
      if (prescriptions && prescriptions.length > 0) {
        for (const prescription of prescriptions) {
          await tx.prescription.create({
            data: {
              medicalRecordId: medicalRecord.id,
              productId: parseInt(prescription.productId),
              quantity: parseFloat(prescription.quantity),
              dosage: prescription.dosage.trim(),
              frequency: prescription.frequency?.trim() || null,
              duration: prescription.duration?.trim() || null,
              instructions: prescription.instructions?.trim() || null,
              startDate: prescription.startDate ? new Date(prescription.startDate) : new Date(),
              endDate: prescription.endDate ? new Date(prescription.endDate) : null,
            }
          })
        }
      }

      // 6. Actualizar peso de la mascota si se proporciona
      if (weight && parseFloat(weight) !== pet.currentWeight) {
        await tx.pet.update({
          where: { id: parseInt(petId) },
          data: { currentWeight: parseFloat(weight) }
        })

        // Crear registro en historial de pesos
        await tx.petWeight.create({
          data: {
            petId: parseInt(petId),
            weight: parseFloat(weight),
            measurementDate: new Date(visitDate),
            recordedBy: parseInt(veterinarianId),
            notes: 'Peso registrado durante consulta médica'
          }
        })
      }

      return medicalRecord
    })

    // Devolver el registro completo creado
    const fullRecord = await prisma.medicalRecord.findUnique({
      where: { id: result.id },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            internalId: true,
            species: true,
            breed: true,
            owner: {
              select: {
                name: true,
                identificationNumber: true,
              }
            }
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

    return NextResponse.json(fullRecord, { status: 201 })

  } catch (error) {
    console.error('Error creating medical record:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}