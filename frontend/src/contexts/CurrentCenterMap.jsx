import { createContext, useContext, useState, useMemo, useEffect } from "react";
import propTypes from "prop-types";
import expressAPI from "../service/expressAPI";

const CurrentCenterMapContext = createContext();

export const useCurrentMapContext = () => useContext(CurrentCenterMapContext);

export function CurrentCenterMapContextProvider({ children }) {
  const initialCity = [44.865756, -0.559059];
  const [coordinates, setCoordinates] = useState(initialCity);
  const [isModalOpen, setModalOpen] = useState(true);
  const [markers, setMarkers] = useState([
    {
      id: 6274,
      coordonnees: [44.8630867, -0.5667689],
      nom_station: "Bordeaux, 204 Cours Saint-Louis",
      adresse_station: "204 Cours Saint-Louis 33300 Bordeaux",
      distance: 0.6783180388265538,
      name: "FRESHMILE",
      condition_acces: "Accès libre",
    },
  ]);

  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  };

  function success(pos) {
    setCoordinates([pos.coords.latitude, pos.coords.longitude]);
    setModalOpen(false);
  }

  function error(err) {
    console.warn(`ERREUR (${err.code}): ${err.message}`);
  }
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(success, error, options);
    if (isModalOpen === false) {
      expressAPI
        .post(`/station/bornes-list`, coordinates)
        .then((res) =>
          res.data.map((elem) => ({
            ...elem,
            coordonnees: [
              parseFloat(elem.latitude),
              parseFloat(elem.longitude),
            ],
          }))
        )
        .then((formatedData) => {
          setMarkers(formatedData);
        })
        .catch((e) => console.error(e));
    }
  }, [isModalOpen]);

  const contextValues = useMemo(
    () => ({
      coordinates,
      setCoordinates,
      isModalOpen,
      setModalOpen,
      markers,
      setMarkers,
    }),
    [coordinates, isModalOpen, markers]
  );

  return (
    <CurrentCenterMapContext.Provider value={contextValues}>
      {children}
    </CurrentCenterMapContext.Provider>
  );
}

CurrentCenterMapContextProvider.propTypes = {
  children: propTypes.node.isRequired,
};
