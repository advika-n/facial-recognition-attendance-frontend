"use client"

import { createContext, useContext, useState, useEffect } from "react"

const API = "https://facial-recognition-attendance-backend-production.up.railway.app"

const DataContext = createContext<any>(null)

export function DataProvider({ children }: any) {
  const [students, setStudents] = useState<any[]>([])
  const [professors, setProfessors] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [classrooms, setClassrooms] = useState<any[]>([])
  const [timetable, setTimetable] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Fetch all data once on app load
  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/students/`).then(r => r.json()),
      fetch(`${API}/api/professors/`).then(r => r.json()),
      fetch(`${API}/api/classes/`).then(r => r.json()),
      fetch(`${API}/api/enrollments/`).then(r => r.json()),
      fetch(`${API}/api/classrooms/`).then(r => r.json()),
      fetch(`${API}/api/timetable/`).then(r => r.json()),
    ]).then(([s, p, cl, en, cr, tt]) => {
      setStudents(s.map((x: any) => ({ id: x.id, regNo: x.registration_number, name: x.name, dept: x.department || "" })))
      setProfessors(p.map((x: any) => ({ id: x.id, profId: x.professor_id, name: x.name, dept: x.department || "" })))
      setClasses(cl.map((x: any) => ({ id: x.id, classId: x.class_id, courseCode: x.course_code, courseName: x.course_name, profId: x.professor_id })))
      setEnrollments(en.map((x: any) => ({ id: x.id, studentReg: x.student__registration_number, classId: x.course__class_id, courseName: x.course__course_name })))
      setClassrooms(cr.map((x: any) => ({ id: x.id, roomName: x.room_name, roomType: x.room_type })))
      setTimetable(tt)
      setDataLoaded(true)
    }).catch(() => setDataLoaded(true))
  }, [])

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
        dataLoaded,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
