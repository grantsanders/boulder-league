import { Ascent } from "../interfaces/scoring";
import { Climber } from "../interfaces/user-info";

export function calculateScore(ascent: Ascent, climber: Climber) {

    let score = 0;

    


    if (ascent.flash) {
        score += (score / 5);
    }


}

export function calculateWorkingGrade(climber: Climber) {

    // get all ascents for climber + total from intial input as totalAscentsPerGrade (list:tuple)
    

    /* if climber.currentWorkingGrade > totalAscentsPerGrade[currentWorkingGrade] => updateWorkingGrade, return false

    if climber.currentWorkingGrade < totalAscentsPerGrade[currentWorkingGrade] => do nothing, return true

    if climber.currentWorkingGrade == totalAscentsPerGrade[currentWorkingGrade] => do nothing, return true

    */

}

export function calculatePersonalPoints(climber: Climber, ascent: Ascent) {


    let pointMultiplier = isWorkingGrade(ascent, climber) ? 1 : 0.5;

    // if ascent.working_grade > climber.currentWorkingGrade => add 1 point
    // if ascent.working_grade == climber.currentWorkingGrade => add 0.5 point
    // if ascent.working_grade < climber.currentWorkingGrade => add 0 point

    // if ascent.absolute_grade > climber.currentAbsoluteGrade => add 1 point
    // if ascent.absolute_grade == climber.currentAbsoluteGrade => add 0.5 point
}

export const isWorkingGrade = (ascent: Ascent, climber: Climber): boolean => 
    climber.current_working_grade == ascent.absolute_grade ?  true : false;


