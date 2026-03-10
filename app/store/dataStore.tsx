"use client"

import { createContext, useContext, useState } from "react"

const DataContext = createContext<any>(null)

export function DataProvider({ children }: any) {
  const [students, setStudents] = useState<any[]>([])
  const [professors, setProfessors] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [classrooms, setClassrooms] = useState<any[]>([])
  const [timetable, setTimetable] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)

  return (
    <DataContext.Provider
      value={{
        students, setStudents,
        professors, setProfessors,
        classes, setClasses,
        enrollments, setEnrollments,
        classrooms, setClassrooms,
        timetable, setTimetable,
        currentUser, setCurrentUser,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
