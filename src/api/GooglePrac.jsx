// // Google Map, GeoCode 연습

// import React, { useCallback, useEffect, useRef, useState } from "react";

// function PlaceMap() {
//   const mapElement = useRef(null);
//   const [address, setAddress] = useState(""); // 주소 상태 추가
//   const [initialLocation, setInitialLocation] = useState({
//     lat: 37.6093347203718,
//     lng: 126.934340439756,
//   });

//   // 지도 api스크립트를 동적으로 로딩하는 역할
//   const loadScript = useCallback((url) => {
//     const firstScript = window.document.getElementsByTagName("script")[0];
//     const newScript = window.document.createElement("script");
//     newScript.src = url;
//     newScript.async = true;
//     newScript.defer = true;
//     firstScript?.parentNode?.insertBefore(newScript, firstScript);
//   }, []);

//   // script에서 google map api를 가져온 후에 실행될 callback 함수
//   // 지도 초기화 함수
//   const initMap = useCallback(() => {
//     // google이 정의되었을 때만 지도와 마커 생성
//     const { google } = window;
//     if (!mapElement.current || !google) return;

//     const map = new google.maps.Map(mapElement.current, {
//       zoom: 17,
//       center: initialLocation,
//     });
//     // 마커 생성
//     const marker = new google.maps.Marker({
//       position: initialLocation,
//       map,
//     });

//     // 마커 클릭 시 주소 가져오기
//     const geocoder = new google.maps.Geocoder();
//     marker.addListener("click", () => {
//       geocoder.geocode({ location: initialLocation }, (results, status) => {
//         if (status === "OK" && results[0]) {
//           setAddress(results[0].formatted_address);
//         } else {
//           setAddress("주소를 가져올 수 없습니다.");
//         }
//         console.log(results);
//         console.log(status);
//       });
//     });
//   }, []);

//   // 주소 가져오기 버튼 클릭 시 실행될 함수
//   const fetchCoordinates = () => {
//     const inputAddress = document.getElementById("address").value;
//     if (inputAddress === "") {
//       alert("주소를 입력하세요.");
//       return;
//     }
//     console.log(inputAddress);

//     const geocoder = new window.google.maps.Geocoder();
//     geocoder.geocode({ address: inputAddress }, (results, status) => {
//       if (status === "OK" && results[0]) {
//         const location = results[0].geometry.viewport;
//         setInitialLocation({ lat: location.Va.lo, lng: location.Ia.lo });
//       } else {
//         alert("주소를 가져올 수 없습니다.");
//       }
//       console.log(results);
//       console.log(status);
//       console.log(initialLocation);
//     });
//   };

//   useEffect(() => {
//     const script = window.document.getElementsByTagName("script")[0];
//     const includeCheck = script.src.startsWith(
//       "https://maps.googleapis.com/maps/api"
//     );

//     // script 중복 호출 방지
//     if (includeCheck) return initMap();

//     window.initMap = initMap;
//     loadScript(
//       "https://maps.googleapis.com/maps/api/js?key=AIzaSyArdwSvnMVGKTD_LUxm_pGKnDDnrUSeZDY&callback=initMap&language=en"
//     );
//   }, [initMap, loadScript]);

//   useEffect(() => {
//     initMap(); // 초기화 함수 호출
//   }, [initMap, initialLocation]); // initialLocation 변경 시에도 호출

//   return (
//     <>
//       <div>
//         <div ref={mapElement} style={{ minHeight: "400px", width: "600px" }} />
//         <div style={{ display: "flex" }}>
//           <p>{address}</p>
//           <button style={{ marginLeft: "auto" }}>주소복사</button>
//         </div>
//       </div>
//       <div>
//         <input
//           id="address"
//           type="text"
//           placeholder="Enter an address"
//           style={{ marginBottom: "10px" }}
//         />
//         <button onClick={fetchCoordinates}>주소 가져오기</button>
//       </div>
//     </>
//   );
// }

// export default PlaceMap;
