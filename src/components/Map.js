import React, { useRef, useEffect ,useState} from 'react'
import { Link } from 'react-router-dom';
// import '../styles/Sizing.css'
import "../styles/Map.css"
import mapboxgl from "mapbox-gl";
import features from './Accesspoints.json';
import boro from './BoroughNYC.json'
import Accesspointpopup  from './Accesspointpopup';
import Breadcrumb from 'react-bootstrap/Breadcrumb';

mapboxgl.accessToken =
  "pk.eyJ1IjoiYXN3YXRoaXMwNyIsImEiOiJjbG1pcG5nbjcwc3NiM2xuc3dmZHc4bHhxIn0.Sjxf7YoCzfBIm7t0zbnFnQ";
  const boroughCodes = {
    'Bronx': 'BX',
    'Queens': 'QU',
    'Manhattan': 'MN',
    'Brooklyn': 'BK',
    'Staten Island': 'SI'
  };
  const boroughCoordinates = {
    Bronx: [-73.8568, 40.8572],     
    Queens: [-73.8258, 40.7128],    
    Manhattan: [-74.006, 40.7128], 
    Brooklyn: [-73.9465, 40.6782],  
    'Staten Island': [-74.1531, 40.5795]  
  };
  
let clickedBorough;
  
const Map = ({ cen, setCen }) => {
  const [showCustomPopup, setShowCustomPopup] = useState(false);
  const [popupData, setPopupData] = useState(null);
 const mapContainerRef = useRef(null);
 const closePopup = () => {
  setShowCustomPopup(false);
};
  // Initialize map when component mounts
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: cen,
      zoom: 8.58
    });
 
    map.on('load', () => {
      map.addSource('hotspot', {
      'type': 'geojson',
     'data':"http://192.168.3.55:8080/api/v1/geojson_accesspoint"
   
      });
      map.addSource('boronyc',{
        type: 'geojson',
        'data':boro
      })
      map.addLayer({
        'id':"add-boro",
        'type':"fill",
        "source":"boronyc",
        "paint": {
          "fill-color": [
            "match",
            ["get", "boro_name"], 
            "Bronx", "#a8f7bc",
            "Queens", "#a4dafb", 
            "Manhattan", "#fba4f6", 
            "Brooklyn", "#f1fba4", 
            "Staten Island", "#f97f9d", 
          
            "#44AB80"
          ],      
          "fill-opacity": 0.2,
          // "mzoom": 12
          
        }  ,
        "maxzoom":11      
      })
      map.addLayer({
        'id':"add-border",
        'type':"line",
        "source":"boronyc",
        "paint": {
          "line-color": [
            "match",
            ["get", "boro_name"], 
            "Bronx", "#0c9c30", 
            "Queens", "#076197", 
            "Manhattan", "#921b8b",
            "Brooklyn", "#a9bd0e", 
            "Staten Island", "#b80a35", 
            "#1a5b40"
          ],
         
          "line-width": 2,
          
        } ,
        "maxzoom":11      
      })   
         map.addLayer({
        "id": "accesspoints",
        "type": "circle",
        "source": "hotspot",
        "paint": {
          "circle-color": 
          "#002e63" ,  
          "circle-radius": 8,
          // "circle-opacity":0.4
        },
        'minzoom': 11, 
      });
     
      map.on('click', 'accesspoints', (event) => {
        const feature = event.features[0].properties;
        if(boroughCodes[clickedBorough]===event.features[0].properties.Borough){
        setPopupData(feature);
        setShowCustomPopup(true);
        setSelected("AP")
        }
      });

     
    
    map.on('click',"add-boro",(event)=>{
      const layerId = `accesspoints`;
     clickedBorough = event.features[0].properties.boro_name;
 const centerCoordinates = boroughCoordinates[clickedBorough];
      const zoomLevel = 11; 
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map.getSource(layerId)) {
        map.removeSource(layerId);
      }
      new mapboxgl.Popup()
      map.flyTo({
        center: centerCoordinates,
        zoom: zoomLevel,
        essential: true 
      });
      map.addLayer({
        "id": layerId,
        "type": "circle",
        "source": "hotspot",
        "paint": {
          "circle-color": [
            "match",
            ["get",  `status`], 
            `Fine`, "#7de05c",
            'Not_Fine',"#ff0000",
          "rgba(255, 0, 0, 0)"
          ],
           
          "circle-radius": 8,
          // "circle-opacity":0.6
        },
        'minzoom': 11, 
      });
      // console.log(event.features[0].properties.boro_name)
     
    })


          
         });
         let popup = null;
         map.on('mousemove', 'accesspoints', (event) => {
             if (popup) {
                 popup.remove();
             }
          
             if(boroughCodes[clickedBorough]===event.features[0].properties.Borough){
           
             popup = new mapboxgl.Popup()
                 .setLngLat(event.features[0].geometry.coordinates)
                 .setHTML(`Access point_ID: ${event.features[0].properties.ap_id}</br>Boroname: ${event.features[0].properties.Borough}`)
                 .addTo(map);
             }
                 // console.log(event.features[0])
         });    
         map.on('mouseleave', 'accesspoints', () => {
             if (popup) {
                 popup.remove();
             }
         });
    map.addControl(new mapboxgl.NavigationControl(), "top-left");

    // Clean up on unmount
    return () => map.remove();
  }, [cen]);

const [selected,setSelected] = useState('AP');

  return <div id="main" ><div className="map-container mainsize" ref={mapContainerRef}  ></div> {showCustomPopup && (
    <div className="custom-popup" >
      <button onClick={closePopup}>X </button>
      <Breadcrumb data-bs-theme="dark" className='breadcrumb'>
  <Breadcrumb.Item href="#" className='bc1' active={selected === "AP"} onClick={()=>{setSelected("AP")}} >AP</Breadcrumb.Item>
  <Breadcrumb.Item href="#" className='bc2 bcc' active={selected === "Interface"} onClick={()=>{setSelected("Interface")}}>Interface</Breadcrumb.Item>
  <Breadcrumb.Item href="#" className='bc3' active={selected === "SSID"} onClick={()=>{setSelected("SSID")}}>SSID</Breadcrumb.Item>
</Breadcrumb>
      <Accesspointpopup data={popupData} selected={selected} setSelected={setSelected}/>
    </div>
  )}</div>;
};

export default Map;

