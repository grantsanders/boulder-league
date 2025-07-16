import { Ascent } from "../interfaces/scoring";
import { Climber } from "../interfaces/user-info";

export function calculateScore(ascent: Ascent, climber: Climber) {

    let score = 0;
}

export function calculatePersonalPoints(climber: Climber, ascent: Ascent) {

    const gradeDifference = ascent.absolute_grade - ascent.working_grade
    
    if (gradeDifference < -3) { 
        return 0;
    }

    let basePoints = 100

    let points = basePoints + (gradeDifference * 25)
    
    if (ascent.flash) {
      points = Math.floor(points * 1.2)
    }
    
    auditWorkingGrade(climber, ascent);

    
    return points
}

export const isWorkingGrade = (ascent: Ascent, climber: Climber): boolean => 
    climber.current_working_grade == ascent.absolute_grade ?  true : false;

export function auditWorkingGrade(climber: Climber, ascent: Ascent) {

        

}
