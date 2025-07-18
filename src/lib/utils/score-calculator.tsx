import { Ascent } from "../interfaces/scoring";
import { Climber } from "../interfaces/user-info";

export function calculateScore() {
    // TODO: Implement this function
    return 0;
}

export function calculatePersonalPoints(climber: Climber, ascent: Ascent) {
    const gradeDifference = ascent.absolute_grade - ascent.working_grade_when_sent
    if (gradeDifference < -3) { 
        return 0;
    }
    const basePoints = 100
    let points = basePoints + (gradeDifference * 25)
    if (ascent.is_flash) {
      points = Math.floor(points * 1.2)
    }
    // auditWorkingGrade(climber, ascent);
    return points
}

export const isWorkingGrade = () => false; // TODO: Implement this function

export function auditWorkingGrade() {
    // TODO: Implement working grade audit logic
}
