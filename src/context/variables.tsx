import { createContext, useState } from "react"

export const variablesContext = createContext({})

export const VariablesProvider = ({ children }) => {

    const [variables, setVariables] = useState({})

    return (
        <variablesContext.Provider value={{variables,setVariables}}>
            {children}
        </variablesContext.Provider>
    )

}