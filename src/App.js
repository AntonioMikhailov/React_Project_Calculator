import React, { useReducer } from "react";
import DigitButton from "./DigitButton";
import OperationButton from "./OperatrionButton";
 // назначаем кнопки
export const ACTIONS = {
 ADD_DIGIT: 'add-digit',
 CHOOSE_OPERATION: 'choose-operation',
 CLEAR: 'clear',
 DELETE_DIGIT: 'delete-digit',
 EVALUATE: 'evaluate'
}
function reducer(state, {type, payload}) {
    switch(type)  {
    case ACTIONS.ADD_DIGIT:
// после нажатия на знак равно надо начать новый цикл ввода значений
if(state.overwrite) { // overwrite меняется на true ниже в EVALUATE
  return {
    ...state, currentOperand: payload.digit,
    overwrite: false  // меняем опять на false
   }
}
      // ограничиваем ввод нескольких нулей подряд 
    if(payload.digit === '0' && state.currentOperand === '0') return state
        // ограничиваем ввод нескольких точек 
     if(payload.digit === "." && (state.currentOperand || []).includes(".")) return state 
        // по умолчанию добавляем к текущему числу новое из payload.digit
    return {...state, currentOperand: `${state.currentOperand || ''}${payload.digit}`}
case ACTIONS.CHOOSE_OPERATION: 
if(state.currentOperand == null && state.previousOperand ==  null) {// без строгого сравнения!!!
  return state
}
// если после первого ввода числа мы ввели оператор Плюс Но потом решили изменить его на Минус то мы можем обновить оператор на лету, кликнув на другом операторе и продолжить вычисления
if(state.currentOperand == null) {
 return {
  ...state,
  operation: payload.operation,
 }
}
  // если вводим Первые числа и жмем на знак Плюс - сработает это условие и они станут Current
// при вводе первых цифр и после того как нажимаем на + или другой операнд эти значения становятся previousOperand а новые становятся current и идет вычисление автоматически БЕЗ нажатия на кнопку Равно . Также и сдругими операторами  20-53
 if( state.previousOperand == null) { 
  return {
...state,
    operation: payload.operation,
    previousOperand: state.currentOperand,
   currentOperand: null,
  }
 }
 // Но если после ввода первой цифры и нажатия на знак Плюс нажать на другую цифру и после этого еще раз нажать на плюс  предыдущие значения сложатся автоматически с текущим  и увидим новое значение в Previos  - жать на знак Равно не обязательно - мы можем продолжать суммирование таким способом
 return {
  ...state,
  previousOperand: evaluate(state), // запускается ф. и ей передается предыдущее значение
  operation: payload.operation,
  currentOperand: null
 }
// очистка поля
    case ACTIONS.CLEAR: 
      return {} // очищаем поле ввода
    // удаляем лишние цифры
    case ACTIONS.DELETE_DIGIT: 
    if(state.overwrite) {
      return {
        ...state,
        overwrite: false,
        currentOperand: null
      }
    }
    if(state.currentOperand == null) return state
    if(state.currentOperand.length === 1) { // если одна цифра
      return {
        ...state,
        currentOperand: null
      }
    }
    // по умолчанию
    return {
      ...state,
      currentOperand: state.currentOperand.slice(0, -1) // удалит последнюю цифру в строке
    }
// знак равно
    case ACTIONS.EVALUATE:
      // если нет данных возвращаем state исходный - ничего не делаем
if(state.operation == null || state.currentOperand == null || state.previousOperand == null) {
  return state
}
// если есть данные
return {
  ...state,
  overwrite: true, // Работает НО если  3+3 нажать равно -получим 6  и если потом ввести число 2 получим 62 - а надо чтобы просто ввелось новое начальное значение - поэтому надо перезаписать значение
  previousOperand: null,
  operation: null,
  currentOperand: evaluate(state),
  }
    default:
  }
} 
// делаем разделители между цифрами для удобства integer - целое число
const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {maximumFractionDigits: 0})
// ф. Для форматирования
function formatOperand(operand) { 
  if( operand == null) return // если пустой.   
// целое число и десятичная часть 
  const [integer, decimal] = operand.split('.')
  if(decimal == null  ) return INTEGER_FORMATTER.format(integer)
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`
}
// Функция Вычислений
function evaluate({currentOperand, previousOperand, operation}) { 
  // конвертируем в числа чтобы делать математические операции
// console.log(previousOperand, typeof previousOperand ); // 58.820 string
  const prev = parseFloat(previousOperand)
  // console.log(prev, typeof prev); // 58.820 number
  const current = parseFloat(currentOperand)
  if(isNaN(prev) || isNaN(current) ) return  ''  // если не число  - пустая строка
  let computation = '' // по умолчанию результат вычисления пустая строка
  switch(operation) {
    case '+':
      computation = prev + current 
      break;
       case '-': 
      computation = prev - current 
      break;
      case '*': 
      computation = prev * current 
      break;
      case '÷': 
      computation = prev / current 
      break;
      default:
  }
  return computation.toString() // конвертируем в строку  
}
function App() {
  const [{currentOperand, previousOperand, operation}, dispatch] = useReducer(reducer, {})
  return (
    <>
 <div className='calculator-grid' >
<div className="output">
  <div className="previous-operand">{formatOperand(previousOperand)} {operation} </div>
  <div className="current-operand">{formatOperand(currentOperand)} </div>
</div>
<button className="span-two"
onClick={()=> dispatch({type: ACTIONS.CLEAR})}>AC</button>
<button onClick={()=> dispatch({type: ACTIONS.DELETE_DIGIT})}>DEL</button>
<OperationButton operation='÷' dispatch={dispatch}/>
<DigitButton digit='1' dispatch={dispatch}/>
<DigitButton digit='2' dispatch={dispatch}/>
<DigitButton digit='3' dispatch={dispatch}/>
<OperationButton operation='*' dispatch={dispatch}/>
 <DigitButton digit='4' dispatch={dispatch}/>
<DigitButton digit='5' dispatch={dispatch}/>
<DigitButton digit='6' dispatch={dispatch}/>
<OperationButton operation='+' dispatch={dispatch}/>
<DigitButton digit='7' dispatch={dispatch}/>
<DigitButton digit='8' dispatch={dispatch}/>
<DigitButton digit='9' dispatch={dispatch}/>
<OperationButton operation='-' dispatch={dispatch}/>
<DigitButton digit='.' dispatch={dispatch}/>
<DigitButton digit='0' dispatch={dispatch}/>
<button className='span-two' onClick={()=> dispatch({type: ACTIONS.EVALUATE})}>=</button>
 </div>
    </>
  );
}
export default App;
