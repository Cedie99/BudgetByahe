import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker, Polyline } from '@react-google-maps/api';
import { FaMapMarkerAlt, FaFlag } from "react-icons/fa";
import  './MainFeature.css';
import  switchLogo from './assets/loop.png';
import originIcon from './assets/button.png';
import destinationIcon from './assets/travel.png';

const containerStyle = {
  width: '100vw',
  height: '100vh'
};


const center = {
  lat: 14.86994, // Approximate latitude of Santa Maria town center
  lng: 121.00238 // Approximate longitude of Santa Maria town center
};

const libraries = ['places'];


/* main road */
const jeepneyRoutePath = [
  /*{ lat: 14.815362, lng: 120.960062 },
  { lat: 14.816254508841036, lng: 120.95902354973322},
  { lat: 14.817388, lng: 120.958315 },
  { lat: 14.817788, lng: 120.959148 },
  { lat: 14.818381, lng: 120.960261},*/
  { lat: 14.818701, lng: 120.960834 },
  { lat: 14.819581, lng: 120.961093},
  { lat: 14.821052773490049, lng: 120.96152825856048 },
  { lat: 14.822075862447317, lng: 120.96179566065561 },
  { lat: 14.822529397776144, lng: 120.96191111765972}, 
  { lat: 14.822567, lng: 120.961921 }, 
  { lat: 14.82242, lng: 120.96369 },
  { lat: 14.82239, lng: 120.96436 },
  { lat: 14.82236, lng: 120.96469 },
  { lat: 14.82235, lng: 120.96547 },
  { lat: 14.82239, lng: 120.96588 },
  { lat: 14.82243, lng: 120.96623 },
  { lat: 14.8225, lng: 120.96658 },
  { lat: 14.82263, lng: 120.96726 },
  { lat: 14.82266, lng: 120.9674 },
  { lat: 14.82268, lng: 120.96754 },
  { lat: 14.82352, lng: 120.96806 },
  { lat: 14.82381, lng: 120.96826 },
  { lat: 14.82389, lng: 120.96831 },
  { lat: 14.82393, lng: 120.96834 },
  { lat: 14.82433, lng: 120.96862 },
  { lat: 14.82467, lng: 120.96885 },
  { lat: 14.82485, lng: 120.96898 },
  { lat: 14.82546, lng: 120.9694 },
  { lat: 14.82562, lng: 120.9695 },
  { lat: 14.82598, lng: 120.96977 },
  { lat: 14.82679, lng: 120.97032 },
  { lat: 14.82711, lng: 120.97057 },
  { lat: 14.82731, lng: 120.97071 },
  { lat: 14.82771, lng: 120.97099 },
  { lat: 14.8292, lng: 120.97199 },
  { lat: 14.82997, lng: 120.97253 },
  { lat: 14.83016, lng: 120.97267 },
  { lat: 14.83049, lng: 120.97291 },
  { lat: 14.83168, lng: 120.97372 },
  { lat: 14.83209, lng: 120.974 },
  { lat: 14.83258, lng: 120.97435 },
  { lat: 14.83368, lng: 120.9751 },
  { lat: 14.83387, lng: 120.97525 },
  { lat: 14.83436, lng: 120.97559 },
  { lat: 14.83445, lng: 120.97565 },
  { lat: 14.83452, lng: 120.97573 },
  { lat: 14.83489, lng: 120.97588 },
  { lat: 14.83502, lng: 120.97593 },
  { lat: 14.83503, lng: 120.97593 },
  { lat: 14.83519, lng: 120.976 },
  { lat: 14.8352, lng: 120.976 },
  { lat: 14.83542, lng: 120.97608 },
  { lat: 14.83564, lng: 120.9762 },
  { lat: 14.83599, lng: 120.97645 },
  { lat: 14.83624, lng: 120.97662 },
  { lat: 14.83638, lng: 120.97673 },
  { lat: 14.83645, lng: 120.97678 },
  { lat: 14.83654, lng: 120.97682 },
  { lat: 14.83689, lng: 120.97709 },
  { lat: 14.83721, lng: 120.97728 },
  { lat: 14.83787, lng: 120.9778 },
  { lat: 14.83826, lng: 120.97812 },
  { lat: 14.83892, lng: 120.97862 },
  { lat: 14.83921, lng: 120.97883 },
  { lat: 14.83961, lng: 120.97916 },
  { lat: 14.83981, lng: 120.9793 },
  { lat: 14.84015, lng: 120.97954 },
  { lat: 14.84054, lng: 120.97968 },
  { lat: 14.84101, lng: 120.9798 },
  { lat: 14.84139, lng: 120.9799 },
  { lat: 14.84169, lng: 120.97998 },
  { lat: 14.84184, lng: 120.98002 },
  { lat: 14.84242, lng: 120.98018 },
  { lat: 14.84278, lng: 120.98026 },
  { lat: 14.84285, lng: 120.98028 },
  { lat: 14.84326, lng: 120.98037 },
  { lat: 14.8434, lng: 120.98041 },
  { lat: 14.84345, lng: 120.98042 },
  { lat: 14.84424, lng: 120.98064 },
  { lat: 14.84469, lng: 120.98067 },
  { lat: 14.8447, lng: 120.98067 },
  { lat: 14.84515, lng: 120.98068 },
  { lat: 14.84563, lng: 120.9807 },
  { lat: 14.84582, lng: 120.9807 },
  { lat: 14.84615, lng: 120.98071 },
  { lat: 14.84633, lng: 120.98072 },
  { lat: 14.84635, lng: 120.98072 },
  { lat: 14.84687, lng: 120.98073 },
  { lat: 14.84706, lng: 120.98072 },
  { lat: 14.8472, lng: 120.98073 },
  { lat: 14.84762, lng: 120.98084 },
  { lat: 14.84769, lng: 120.98086 },
  { lat: 14.84791, lng: 120.98095 },
  { lat: 14.84865, lng: 120.98115 },
  { lat: 14.84934, lng: 120.98138 },
  { lat: 14.84936, lng: 120.98139 },
  { lat: 14.84937, lng: 120.98139 },
  { lat: 14.8495, lng: 120.98146 },
  { lat: 14.84954, lng: 120.9815 },
  { lat: 14.84964, lng: 120.98159 },
  { lat: 14.84979, lng: 120.98178 },
  { lat: 14.85002, lng: 120.98208 },
  { lat: 14.85002, lng: 120.98209 },
  { lat: 14.85018, lng: 120.98234 },
  { lat: 14.85055, lng: 120.983 },
  { lat: 14.85062, lng: 120.98311 },
  { lat: 14.8508, lng: 120.98341 },
  { lat: 14.85086, lng: 120.9835 },
  { lat: 14.85091, lng: 120.98355 },
  { lat: 14.85103, lng: 120.98368 },
  { lat: 14.85145, lng: 120.98408 },
  { lat: 14.85155, lng: 120.98419 },
  { lat: 14.85159, lng: 120.98423 },
  { lat: 14.85195, lng: 120.98457 },
  { lat: 14.85245, lng: 120.98504 },
  { lat: 14.85247, lng: 120.98507 },
  { lat: 14.85298, lng: 120.98557 },
  { lat: 14.85315, lng: 120.98574 },
  { lat: 14.85325, lng: 120.98583 },
  { lat: 14.85337, lng: 120.98593 },
  { lat: 14.85394, lng: 120.98635 },
  { lat: 14.85407, lng: 120.98645 },
  { lat: 14.85426, lng: 120.9866 },
  { lat: 14.8543, lng: 120.98663 },
  { lat: 14.85447, lng: 120.98675 },
  { lat: 14.85464, lng: 120.98687 },
  { lat: 14.85474, lng: 120.98695 },
  { lat: 14.85487, lng: 120.98704 },
  { lat: 14.85502, lng: 120.98715 },
  { lat: 14.85516, lng: 120.98726 },
  { lat: 14.85522, lng: 120.9873 },
  { lat: 14.85531, lng: 120.98736 },
  { lat: 14.85539, lng: 120.98742 },
  { lat: 14.85578, lng: 120.9877 },
  { lat: 14.85651, lng: 120.98821 },
  { lat: 14.85665, lng: 120.98831 },
  { lat: 14.85701, lng: 120.98857 },
  { lat: 14.85754, lng: 120.98899 },
  { lat: 14.85769, lng: 120.98911 },
  { lat: 14.85771, lng: 120.98912 },
  { lat: 14.85787, lng: 120.98924 },
  { lat: 14.85798, lng: 120.98931 },
  { lat: 14.85799, lng: 120.98932 },
  { lat: 14.85812, lng: 120.9894 },
  { lat: 14.85815, lng: 120.98943 },
  { lat: 14.85831, lng: 120.98954 },
  { lat: 14.85842, lng: 120.98962 },
  { lat: 14.85873, lng: 120.9898 },
  { lat: 14.85895, lng: 120.98992 },
  { lat: 14.85921, lng: 120.99006 },
  { lat: 14.85953, lng: 120.9902 },
  { lat: 14.85986, lng: 120.99034 },
  { lat: 14.8599, lng: 120.99036 },
  { lat: 14.86002, lng: 120.99041 },
  { lat: 14.86023, lng: 120.99049 },
  { lat: 14.86097, lng: 120.99085 },
  { lat: 14.86118, lng: 120.99094 },
  { lat: 14.86134, lng: 120.991 },
  { lat: 14.86142, lng: 120.99103 },
  { lat: 14.86152, lng: 120.99107 },
  { lat: 14.86153, lng: 120.99108 },
  { lat: 14.86191, lng: 120.99126 },
  { lat: 14.86209, lng: 120.99134 },
  { lat: 14.86231, lng: 120.99145 },
  { lat: 14.86254, lng: 120.99156 },
  { lat: 14.86295, lng: 120.99177 },
  { lat: 14.8631, lng: 120.99185 },
  { lat: 14.86319, lng: 120.99189 },
  { lat: 14.86335, lng: 120.99198 },
  { lat: 14.86341, lng: 120.99202 },
  { lat: 14.86363, lng: 120.99215 },
  { lat: 14.86378, lng: 120.99225 },
  { lat: 14.86385, lng: 120.99232 },
  { lat: 14.86394, lng: 120.99242 },
  { lat: 14.86422, lng: 120.99292 },
  { lat: 14.86425, lng: 120.99299 },
  { lat: 14.86427, lng: 120.99306 },
  { lat: 14.86431, lng: 120.99315 },
  { lat: 14.8645, lng: 120.99362 },
  { lat: 14.86458, lng: 120.99383 },
  { lat: 14.86467, lng: 120.99403 },
  { lat: 14.86472, lng: 120.99416 },
  { lat: 14.86484, lng: 120.99446 },
  { lat: 14.86497, lng: 120.99475 },
  { lat: 14.86508, lng: 120.99497 },
  { lat: 14.86515, lng: 120.99512 },
  { lat: 14.8652, lng: 120.99521 },
  { lat: 14.86531, lng: 120.99542 },
  { lat: 14.86536, lng: 120.99552 },
  { lat: 14.86538, lng: 120.99557 },
  { lat: 14.86543, lng: 120.99565 },
  { lat: 14.86552, lng: 120.99583 },
  { lat: 14.86569, lng: 120.99617 },
  { lat: 14.8658, lng: 120.99637 },
  { lat: 14.86594, lng: 120.99661 },
  { lat: 14.86601, lng: 120.99675 },
  { lat: 14.86617, lng: 120.99698 },
  { lat: 14.86627, lng: 120.99712 },
  { lat: 14.86639, lng: 120.99729 },
  { lat: 14.86655, lng: 120.99752 },
  { lat: 14.86658, lng: 120.99756 },
  { lat: 14.86668, lng: 120.99771 },
  { lat: 14.86687, lng: 120.99799 },
  { lat: 14.86692, lng: 120.99807 },
  { lat: 14.86715, lng: 120.99841 },
  { lat: 14.86726, lng: 120.9986 },
  { lat: 14.86735, lng: 120.9988 },
  { lat: 14.86742, lng: 120.99901 },
  { lat: 14.86747, lng: 120.9992 },
  { lat: 14.86749, lng: 120.99931 },
  { lat: 14.86754, lng: 120.99949 },
  { lat: 14.86758, lng: 120.99958 },
  { lat: 14.86765, lng: 120.99974 },
  { lat: 14.86769, lng: 120.9998 },
  { lat: 14.86774, lng: 120.99986 },
  { lat: 14.86794, lng: 121.00006 },
  { lat: 14.86806, lng: 121.00016 },
  { lat: 14.86823, lng: 121.0003 },
  { lat: 14.86828, lng: 121.00034 },
  { lat: 14.86861, lng: 121.0006 },
  { lat: 14.86928, lng: 121.00109 },
  { lat: 14.87026, lng: 121.00184 },
  { lat: 14.87043, lng: 121.00201 },
  { lat: 14.87051, lng: 121.00208 },

  { lat: 14.8706, lng: 121.00216 },
  { lat: 14.87075, lng: 121.00233 },
  { lat: 14.87087, lng: 121.00248 },
  { lat: 14.87102, lng: 121.00273 },
  { lat: 14.87114, lng: 121.00297 },
  { lat: 14.87118, lng: 121.00307 },
  { lat: 14.87133, lng: 121.00355 },
  { lat: 14.8714, lng: 121.00384 },
  { lat: 14.87147, lng: 121.00411 },
  { lat: 14.87156, lng: 121.00442 },
  { lat: 14.87157, lng: 121.00445 },
  { lat: 14.87164, lng: 121.0046 },
  { lat: 14.87186, lng: 121.00504 },
  { lat: 14.87198, lng: 121.00528 },
  { lat: 14.87215, lng: 121.00562 },
  { lat: 14.87228, lng: 121.00583 },
  { lat: 14.87243, lng: 121.00606 },
  { lat: 14.87262, lng: 121.00623 },
  { lat: 14.87275, lng: 121.00633 },
  { lat: 14.87312, lng: 121.00659 },
  { lat: 14.87314, lng: 121.0066 },
  { lat: 14.87335, lng: 121.00677 },
  { lat: 14.87374, lng: 121.00705 },
  { lat: 14.87406, lng: 121.00728 },
  { lat: 14.87425, lng: 121.0074 },
  { lat: 14.87436, lng: 121.00748 },
  { lat: 14.87449, lng: 121.00758 },
  { lat: 14.87453, lng: 121.00761 },
  { lat: 14.87481, lng: 121.00782 },
  { lat: 14.87506, lng: 121.00803 },
  { lat: 14.87513, lng: 121.00808 },
  { lat: 14.87545, lng: 121.00838 },
  { lat: 14.87546, lng: 121.0084 },
  { lat: 14.87579, lng: 121.00871 },
  { lat: 14.87583, lng: 121.00875 },
  { lat: 14.87596, lng: 121.00889 },
  { lat: 14.87604, lng: 121.00897 },
  { lat: 14.87635, lng: 121.00926 },
  { lat: 14.87663, lng: 121.00951 },
  { lat: 14.87664, lng: 121.00952 },
  { lat: 14.87696, lng: 121.00973 },
  { lat: 14.87711, lng: 121.00982 },
  { lat: 14.87726, lng: 121.0099 },
  { lat: 14.87731, lng: 121.00992 },
  { lat: 14.8774, lng: 121.00996 },
  { lat: 14.87759, lng: 121.00999 },
  { lat: 14.87789, lng: 121.01001 },
  { lat: 14.87825, lng: 121.01002 },
  { lat: 14.8786, lng: 121.01004 },
  { lat: 14.87868, lng: 121.01006 },
  { lat: 14.87876, lng: 121.01008 },
  { lat: 14.87878, lng: 121.01009 },
  { lat: 14.87882, lng: 121.0101 },
  { lat: 14.87897, lng: 121.01019 },
  { lat: 14.87908, lng: 121.01027 },
  { lat: 14.87921, lng: 121.01039 },
  { lat: 14.87945, lng: 121.01055 },
  { lat: 14.87981, lng: 121.01081 },
  { lat: 14.88023, lng: 121.01113 },
  { lat: 14.88047, lng: 121.01129 },
  { lat: 14.88105, lng: 121.01169 },
  { lat: 14.88107, lng: 121.01172 },
  { lat: 14.88127, lng: 121.01192 },
  { lat: 14.88133, lng: 121.01199 },
  { lat: 14.88137, lng: 121.01205 },
  { lat: 14.88144, lng: 121.01217 },
  { lat: 14.8815, lng: 121.01228 },
  { lat: 14.88156, lng: 121.0124 },
  { lat: 14.88177, lng: 121.01284 },
  { lat: 14.88185, lng: 121.01299 },
  { lat: 14.88191, lng: 121.01308 },
  { lat: 14.88197, lng: 121.01315 },
  { lat: 14.88204, lng: 121.0132 },
  { lat: 14.88212, lng: 121.01324 },
  { lat: 14.88236, lng: 121.01334 },
  { lat: 14.88261, lng: 121.01343 },
  { lat: 14.88271, lng: 121.01346 },
  { lat: 14.88282, lng: 121.0135 },
  { lat: 14.883, lng: 121.0136 },
  { lat: 14.88316, lng: 121.0137 },
  { lat: 14.8834, lng: 121.01387 },
  { lat: 14.88363, lng: 121.01404 },
  { lat: 14.88373, lng: 121.01411 },
  { lat: 14.88377, lng: 121.01415 },
  { lat: 14.88431, lng: 121.01464 },
  { lat: 14.88449, lng: 121.01482 },
  { lat: 14.88459, lng: 121.0149 },
  { lat: 14.88463, lng: 121.01494 },
  { lat: 14.88471, lng: 121.01499 },
  { lat: 14.88478, lng: 121.01502 },
  { lat: 14.88489, lng: 121.01507 },
  { lat: 14.88506, lng: 121.01512 },
  { lat: 14.88546, lng: 121.01525 },
  { lat: 14.88573, lng: 121.01532 },
  { lat: 14.88581, lng: 121.01534 },
  { lat: 14.88585, lng: 121.01535 },
  { lat: 14.88598, lng: 121.01538 },
  { lat: 14.88607, lng: 121.01541 },
  { lat: 14.88632, lng: 121.01549 },
  { lat: 14.88648, lng: 121.01557 },
  { lat: 14.88693, lng: 121.0159 },
  { lat: 14.88707, lng: 121.01601 },
  { lat: 14.88721, lng: 121.01612 },
  { lat: 14.88721, lng: 121.01613 },
  { lat: 14.88735, lng: 121.01624 },
  { lat: 14.88765, lng: 121.01646 },
  { lat: 14.88772, lng: 121.01652 },
  { lat: 14.88779, lng: 121.01657 },
  { lat: 14.88782, lng: 121.01659 },
  { lat: 14.88793, lng: 121.01668 },
  { lat: 14.88816, lng: 121.01687 },
  { lat: 14.88821, lng: 121.01692 },
  { lat: 14.8883, lng: 121.01701 },
  { lat: 14.88847, lng: 121.01723 },
  { lat: 14.88855, lng: 121.01735 },
  { lat: 14.88859, lng: 121.01741 },
  { lat: 14.88863, lng: 121.01747 },
  { lat: 14.8887, lng: 121.01756 },
  { lat: 14.88873, lng: 121.01763 },
  { lat: 14.88877, lng: 121.01772 },
  { lat: 14.8888, lng: 121.01786 },
  { lat: 14.88881, lng: 121.01793 },
  { lat: 14.88882, lng: 121.01798 },
  { lat: 14.88882, lng: 121.01803 },
  { lat: 14.88881, lng: 121.01822 },
  { lat: 14.88881, lng: 121.01833 },
  { lat: 14.88884, lng: 121.01845 },
  { lat: 14.8889, lng: 121.01857 },
  { lat: 14.889, lng: 121.01872 },
  { lat: 14.88902, lng: 121.01874 },
  { lat: 14.88913, lng: 121.01886 },
  { lat: 14.8892, lng: 121.01894 },
  { lat: 14.88937, lng: 121.01912 },
  { lat: 14.88946, lng: 121.01921 },
  { lat: 14.88951, lng: 121.01924 },
  { lat: 14.88964, lng: 121.01935 },
  { lat: 14.88977, lng: 121.01944 },
  { lat: 14.88978, lng: 121.01945 },
  { lat: 14.88998, lng: 121.01958 },
  { lat: 14.89028, lng: 121.0198 },
  { lat: 14.89058, lng: 121.02001 },
  { lat: 14.89081, lng: 121.02019 },
  { lat: 14.89109, lng: 121.02043 },
  { lat: 14.89123, lng: 121.02055 },
  { lat: 14.89174, lng: 121.02097 },
  { lat: 14.89204, lng: 121.02125 },
  { lat: 14.89213, lng: 121.02137 },
  { lat: 14.89214, lng: 121.02139 },
  { lat: 14.89216, lng: 121.02142 },
  { lat: 14.89217, lng: 121.02145 },
  { lat: 14.89218, lng: 121.02148 },
  { lat: 14.89228, lng: 121.02194 },
  { lat: 14.89229, lng: 121.02197 },
  { lat: 14.89235, lng: 121.02222 },
  { lat: 14.89238, lng: 121.02231 },
  { lat: 14.8924, lng: 121.02242 },
  { lat: 14.89247, lng: 121.02272 },
  { lat: 14.8926, lng: 121.02295 },
  { lat: 14.89264, lng: 121.02301 },
  { lat: 14.89266, lng: 121.02305 },
  { lat: 14.89269, lng: 121.02309 },
  { lat: 14.89277, lng: 121.02316 },
  { lat: 14.89284, lng: 121.02322 },
  { lat: 14.89296, lng: 121.0233 },
  { lat: 14.89364, lng: 121.02348 },
  { lat: 14.89392, lng: 121.0235 },
  { lat: 14.8941, lng: 121.02352 },
  { lat: 14.89426, lng: 121.02359 },
  { lat: 14.89446, lng: 121.0237 },
  { lat: 14.89449, lng: 121.02373 },
  { lat: 14.895, lng: 121.02419 },
  { lat: 14.8953, lng: 121.02441 },
  { lat: 14.89562, lng: 121.02465 },
  { lat: 14.89579, lng: 121.02479 },
  { lat: 14.89594, lng: 121.0249 },
  { lat: 14.89615, lng: 121.02508 },
  { lat: 14.89626, lng: 121.02519 },
  { lat: 14.89644, lng: 121.02541 },
  { lat: 14.89666, lng: 121.02583 },
  { lat: 14.89676, lng: 121.02603 },
  { lat: 14.89689, lng: 121.02632 },
  { lat: 14.89703, lng: 121.02662 },
  { lat: 14.89704, lng: 121.02663 },
  { lat: 14.89714, lng: 121.02686 },
  { lat: 14.89721, lng: 121.02705 },
  { lat: 14.89736, lng: 121.0273 },
  { lat: 14.8974, lng: 121.02738 },
  { lat: 14.8975, lng: 121.02753 },
  { lat: 14.89766, lng: 121.02779 },
  { lat: 14.89777, lng: 121.02802 },
  { lat: 14.89779, lng: 121.0281 },
  { lat: 14.89783, lng: 121.02852 },
  { lat: 14.89778, lng: 121.02861 },
  { lat: 14.89775, lng: 121.02872 },
  { lat: 14.89771, lng: 121.02889 },
  { lat: 14.89768, lng: 121.02908 },
  { lat: 14.89766, lng: 121.02916 },
  { lat: 14.89755, lng: 121.02954 },
  { lat: 14.89752, lng: 121.02964 },
  { lat: 14.89748, lng: 121.02983 },
  { lat: 14.89747, lng: 121.02991 },
  { lat: 14.89745, lng: 121.03022 },
  { lat: 14.89745, lng: 121.03061 },
  { lat: 14.89746, lng: 121.03072 },
  { lat: 14.89748, lng: 121.03081 },
  { lat: 14.89749, lng: 121.03095 },
  { lat: 14.89752, lng: 121.03107 },
  { lat: 14.89755, lng: 121.0312 },
  { lat: 14.89763, lng: 121.03145 },
  { lat: 14.89771, lng: 121.03167 },
  { lat: 14.89793, lng: 121.03221 },
  { lat: 14.89807, lng: 121.03251 },
  { lat: 14.89816, lng: 121.03266 },
  { lat: 14.89831, lng: 121.03286 },
  { lat: 14.8985, lng: 121.03306 },
  { lat: 14.89857, lng: 121.03313 },
  { lat: 14.89887, lng: 121.03338 },
  { lat: 14.89908, lng: 121.03352 },
  { lat: 14.89928, lng: 121.03368 },
  { lat: 14.89941, lng: 121.03378 },
  { lat: 14.89954, lng: 121.03392 },
  { lat: 14.89963, lng: 121.034 },
  { lat: 14.89964, lng: 121.03401 },
  { lat: 14.89971, lng: 121.03409 },
  { lat: 14.89973, lng: 121.03412 },
  { lat: 14.89976, lng: 121.03415 },
  { lat: 14.89984, lng: 121.03424 },
  { lat: 14.89986, lng: 121.03427 },
  { lat: 14.89989, lng: 121.0343 },
  { lat: 14.89991, lng: 121.03433 },
  { lat: 14.89999, lng: 121.03442 },
  { lat: 14.90005, lng: 121.03449 },
  { lat: 14.90009, lng: 121.03455 },
  { lat: 14.90021, lng: 121.0347 },
  { lat: 14.90031, lng: 121.03482 },
  { lat: 14.90033, lng: 121.03484 },
  { lat: 14.90033, lng: 121.03485 },
  { lat: 14.90057, lng: 121.03511 },
  { lat: 14.90084, lng: 121.03538 },
  { lat: 14.90105, lng: 121.0356 },
  { lat: 14.9012, lng: 121.03573 },
  { lat: 14.90123, lng: 121.03575 },
  { lat: 14.90132, lng: 121.03583 },
  { lat: 14.90148, lng: 121.03595 },
  { lat: 14.90155, lng: 121.036 },
  { lat: 14.90174, lng: 121.03612 },
  { lat: 14.90189, lng: 121.03621 },
  { lat: 14.90204, lng: 121.0363 },
  { lat: 14.90211, lng: 121.03635 },
  { lat: 14.90216, lng: 121.03638 },
  { lat: 14.90266, lng: 121.0367 },
  { lat: 14.90471, lng: 121.03799 },
  { lat: 14.90475, lng: 121.03802 },
  { lat: 14.90498, lng: 121.03817 },
  { lat: 14.9057, lng: 121.03863 },
  { lat: 14.90577, lng: 121.03867 },
  { lat: 14.90576, lng: 121.03868 },
  { lat: 14.90576, lng: 121.03869 },
  { lat: 14.90576, lng: 121.0387 },
  { lat: 14.90575, lng: 121.03871 },
  { lat: 14.90575, lng: 121.03872 },
  { lat: 14.90575, lng: 121.03873 },
  { lat: 14.90575, lng: 121.03874 },
  { lat: 14.90576, lng: 121.03875 },
  { lat: 14.90576, lng: 121.03876 },
  { lat: 14.90576, lng: 121.03877 },
  { lat: 14.90577, lng: 121.03878 },
  { lat: 14.90577, lng: 121.03879 },
  { lat: 14.90578, lng: 121.03879 },
  { lat: 14.90578, lng: 121.0388 },
  { lat: 14.90579, lng: 121.0388 },
  { lat: 14.90579, lng: 121.03881 },
  { lat: 14.9058, lng: 121.03881 },
  { lat: 14.90581, lng: 121.03882 },
  { lat: 14.90582, lng: 121.03882 },
  { lat: 14.90583, lng: 121.03882 },
  { lat: 14.90584, lng: 121.03883 },
  { lat: 14.90585, lng: 121.03883 },
  { lat: 14.90586, lng: 121.03883 },
  { lat: 14.90587, lng: 121.03883 },
  { lat: 14.90587, lng: 121.03882 },
  { lat: 14.90588, lng: 121.03882 },
  { lat: 14.90589, lng: 121.03882 },
  { lat: 14.9059, lng: 121.03882 },
  { lat: 14.9059, lng: 121.03881 },
  { lat: 14.90591, lng: 121.03881 },
  { lat: 14.90591, lng: 121.0388 },
  { lat: 14.90592, lng: 121.0388 },
  { lat: 14.90592, lng: 121.03879 },
  { lat: 14.90593, lng: 121.03879 },
  { lat: 14.90593, lng: 121.03878 },
  { lat: 14.90593, lng: 121.03878 },
  { lat: 14.90594, lng: 121.03878 },
  { lat: 14.90594, lng: 121.03877 },
  { lat: 14.90594, lng: 121.03876 },
  { lat: 14.90595, lng: 121.03875 },
  { lat: 14.90595, lng: 121.03874 },
  { lat: 14.90596, lng: 121.03874 },
  { lat: 14.90596, lng: 121.03873 },
  { lat: 14.90596, lng: 121.03872 },
  { lat: 14.90596, lng: 121.03871 },
  { lat: 14.90596, lng: 121.0387 },
  { lat: 14.90596, lng: 121.03869 },
  { lat: 14.90596, lng: 121.03868 },
  { lat: 14.90595, lng: 121.03868 },
  { lat: 14.90595, lng: 121.03867 },
  { lat: 14.90595, lng: 121.03866 },
  { lat: 14.90595, lng: 121.03866 },
  { lat: 14.90594, lng: 121.03865 },
  { lat: 14.90594, lng: 121.03864 },
  { lat: 14.90593, lng: 121.03863 },
  { lat: 14.90593, lng: 121.03863 },
  { lat: 14.90591, lng: 121.03862 },
  { lat: 14.9059, lng: 121.03862 },
  { lat: 14.90589, lng: 121.03862 },
  { lat: 14.90589, lng: 121.03861 },
  { lat: 14.90588, lng: 121.03861 },
  { lat: 14.90587, lng: 121.03861 },
  { lat: 14.90586, lng: 121.03861 },
  { lat: 14.90585, lng: 121.03861 },
  { lat: 14.90584, lng: 121.03861 },
  { lat: 14.90583, lng: 121.03862 },
  { lat: 14.90582, lng: 121.03862 },
  { lat: 14.90581, lng: 121.03862 },
]

const transferPoints = [
  { name: "Norzagaray Crossing", lat: 14.90581, lng: 121.03862 },
  { name: "Partida", lat: 14.893597, lng: 121.023452},
  { name: "Pulong Yantok", lat: 14.890642, lng: 121.019969 },
  { name: "Kanto of Perez", lat: 14.888687, lng: 121.017536},
  { name: "Garden Village", lat: 14.876638, lng: 121.009510},
  { name: "Tierra", lat: 14.873335992345256, lng: 121.00673970657967},
  { name: "Cityland", lat: 14.87055514685738, lng: 121.0021162271413 },
  { name: "Balasing Kanto", lat: 14.865172, lng: 120.995133},
  { name: "Bangka Bangka Kanto", lat: 14.864257, lng: 120.992826},
  { name: "Caypombo Kanto", lat: 14.847646, lng: 120.980770 },
  { name: "Sitio Bato", lat: 14.841415, lng: 120.979800},
  { name: "Malawak", lat: 14.844310, lng: 120.980725},
  { name: "Pintong Bato", lat: 14.840166, lng: 120.979607},
  { name: "Santa Maria Proper", lat: 14.818701, lng: 120.960834 },

  
  { name: "Cityland-Perez Toda", lat: 14.885105, lng: 121.000043},
  { name: "Camangyanan", lat: 14.802373, lng: 120.971376},
];

const getNearestTransferPoint = (point) => {
  let nearest = null;
  let minDistance = Infinity;

  for (const transfer of transferPoints) {
    const distance = Math.sqrt(
      Math.pow(point.lat - transfer.lat, 2) +
      Math.pow(point.lng - transfer.lng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = transfer;
    }
  }
  return nearest;
};

const FareCalculator = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [directionsResult, setDirectionsResult] = useState(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [fare, setFare] = useState(0);
  const [suggestion, setSuggestion] = useState('');
  const [transportMode, setTransportMode] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const originRef = useRef(null);
  const destinationRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyAZH_hOOhFn__misPTBpWebZ7R10PPOKEA',
    libraries
  });

  useEffect(() => {
    if (isLoaded && originRef.current) {
  const autocompleteOrigin = new window.google.maps.places.Autocomplete(originRef.current, {
    fields: ["place_id", "formatted_address", "geometry", "name"], // specify fields
  });

  autocompleteOrigin.addListener("place_changed", () => {
    const place = autocompleteOrigin.getPlace();
    setOrigin(place.formatted_address || place.name);
  });
}

if (isLoaded && destinationRef.current) {
  const autocompleteDestination = new window.google.maps.places.Autocomplete(destinationRef.current, {
    fields: ["place_id", "formatted_address", "geometry", "name"], // specify fields
  });

  autocompleteDestination.addListener("place_changed", () => {
    const place = autocompleteDestination.getPlace();
    setDestination(place.formatted_address || place.name);
  });
}
  }, [isLoaded]);

  const isNearJeepneyRoute = (point) => {
    const threshold = 0.003;
    return jeepneyRoutePath.some(routePoint => {
      const distance = Math.sqrt(
        Math.pow(point.lat - routePoint.lat, 2) +
        Math.pow(point.lng - routePoint.lng, 2)
      );
      return distance <= threshold;
    });
  };

  const extractStepPathPoints = (route) => {
    const steps = route.legs[0].steps;
    const allPoints = [];

    for (const step of steps) {
      const stepPath = step.path;
      if (stepPath && stepPath.length > 0) {
        stepPath.forEach(p => allPoints.push({ lat: p.lat(), lng: p.lng() }));
      }
    }

    return allPoints;
  };

  const processRoute = (route) => {
    const distanceText = route.legs[0].distance.text;
    const distanceValue = parseFloat(distanceText.replace(/[^0-9.]/g, ''));
    const calculatedFare = Math.max(12, distanceValue * 2).toFixed(2);
    
    // Update state synchronously
    setDistanceKm(distanceValue);
    setFare(calculatedFare);
    
    // Set suggestion
    if (distanceValue < 2) setSuggestion('Walking or Tricycle recommended.');
    else if (distanceValue < 10) setSuggestion('Jeepney recommended.');
    else setSuggestion('Bus or Private Vehicle recommended.');

    const routePoints = extractStepPathPoints(route);

    // Get the actual destination coordinates from the route
    const destinationCoords = {
      lat: route.legs[0].end_location.lat(),
      lng: route.legs[0].end_location.lng()
    };

    // Get the actual origin coordinates from the route
    const originCoords = {
      lat: route.legs[0].start_location.lat(),
      lng: route.legs[0].start_location.lng()
    };

    // Determine if route touches jeepney path
    const passesJeepneyRoute = routePoints.some(point => isNearJeepneyRoute(point));
    if (!passesJeepneyRoute) {
      setTransportMode('⚠️ This route is not passable by public jeepneys. Use tricycle or private vehicle for the whole trip.');
      return;
    }

    // Check if origin is directly on jeepney route
    const originOnJeepneyRoute = isNearJeepneyRoute(originCoords);
    
    // Check if destination is directly on jeepney route
    const destinationOnJeepneyRoute = isNearJeepneyRoute(destinationCoords);

    // Find actual entry and exit point to the jeepney route
    const entryPoint = routePoints.find(p => isNearJeepneyRoute(p));
    const exitPoint = [...routePoints].reverse().find(p => isNearJeepneyRoute(p));

    let transferSuggestion = '';
    let stepCounter = 1;

    // Handle origin transfer (only if origin is NOT on jeepney route)
    if (entryPoint && !originOnJeepneyRoute) {
      const pickup = getNearestTransferPoint(entryPoint);
      transferSuggestion += `🚲 STEP ${stepCounter}: From your starting point, take a tricycle to ${pickup.name}\n`;
      transferSuggestion += `    💡 This connects you to the main jeepney route\n`;
      stepCounter++;
    }

    // Add jeepney step if any transfers are involved
    if ((entryPoint && !originOnJeepneyRoute) || (exitPoint && !destinationOnJeepneyRoute)) {
      transferSuggestion += `🚌 STEP ${stepCounter}: Board the Norzagaray-Santa Maria jeepney\n`;
      transferSuggestion += `    💰 Fare: ₱${calculatedFare} | Distance: ${distanceValue}km\n`;
      stepCounter++;
    }

    // Handle destination transfer (only if destination is NOT on jeepney route)
    if (exitPoint && !destinationOnJeepneyRoute) {
      const dropoff = getNearestTransferPoint(exitPoint);
      transferSuggestion += `🚲 STEP ${stepCounter}: Get off the jeepney at ${dropoff.name}\n`;
      transferSuggestion += `    Then take a tricycle to reach your final destination!\n`;
    }

    if(distanceValue > 20){
      setTransportMode(`🚗 LONG DISTANCE TRIP DETECTED! Route outside Santa Maria Bulacan is not covered by Budget Byahe.`);
    }else {
      // Determine final transport mode message
      if (originOnJeepneyRoute && destinationOnJeepneyRoute) {
        setTransportMode(`✅ PERFECT ROUTE! 
      🚌 Take the Norzagaray-Santa Maria jeepney directly from origin to destination
      💰 Estimated Fare: ₱${calculatedFare}
      📍 Both your starting point and destination are along the main jeepney route
      ⏱️ No transfers needed - simple and convenient!`);
      } else if (originOnJeepneyRoute && !destinationOnJeepneyRoute) {
        setTransportMode(`✅ GOOD NEWS! Your origin is on the jeepney route
      
        💰 Jeepney fare: ₱${calculatedFare} | Distance: ${distanceValue}km
      ${transferSuggestion}
      💡 TIP: Total cost will be jeepney fare + tricycle fare to final destination`);
      } else if (!originOnJeepneyRoute && destinationOnJeepneyRoute) {
        setTransportMode(`✅ GREAT! Your destination is directly on the jeepney route
      ${transferSuggestion}🎯 FINAL STOP: Get off the jeepney at your destination
      💡 TIP: No need for additional transport after the jeepney ride!`);
      } else if (transferSuggestion === '') {
        setTransportMode(`✅ EXCELLENT ROUTE!
        🚌 Take the Norzagaray-Santa Maria jeepney for your entire trip
        💰 Estimated Fare: ₱${calculatedFare}
        📍 Your route closely follows the main jeepney path
        ⏱️ Direct trip - no complicated transfers needed!`);
      } else {
        setTransportMode(`⚠️ MULTI-MODAL TRIP REQUIRED
          Your journey involves connecting different transport modes:

          ${transferSuggestion}`);
      }
    };
  }
    

  const calculateRoute = () => {
    const originInput = document.getElementById('origin');
    const destinationInput = document.getElementById('destination');

    const originVal = originInput.value.trim();
    const destinationVal = destinationInput.value.trim();

    if (!originVal || !destinationVal) {
      alert('Please enter both origin and destination.');
      return;
    }

    // Reset states before calculation
    setIsCalculating(true);
    setDirectionsResult(null);
    setDistanceKm(0);
    setFare(0);
    setSuggestion('');
    setTransportMode('');
    setSelectedRouteIndex(0);

    setOrigin(originVal);
    setDestination(destinationVal);

  
    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route({
      origin: originVal,
      destination: destinationVal,
      travelMode: window.google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true,
      avoidFerries: true,
      avoidTolls: false, // Changed to false to get more route options
      optimizeWaypoints: false, // Add this for more consistent results
    }, (result, status) => {
      setIsCalculating(false);
      
      if (status === window.google.maps.DirectionsStatus.OK) {
        // Sort routes by distance to get consistent ordering
        const sortedRoutes = result.routes.sort((a, b) => {
          const distanceA = a.legs[0].distance.value;
          const distanceB = b.legs[0].distance.value;
          return distanceA - distanceB;
        });

        // Filter routes if needed, but keep original if no filtered routes
        const filteredRoutes = sortedRoutes.filter(route =>
          /national|highway|main|rd|road/i.test(route.summary)
        );

        const finalRoutes = filteredRoutes.length > 0 ? filteredRoutes : sortedRoutes;

        const directionsWithFilteredRoutes = { ...result, routes: finalRoutes };
        setDirectionsResult(directionsWithFilteredRoutes);
        setSelectedRouteIndex(0);
        
        // Process the first route immediately
        if (finalRoutes.length > 0) {
          processRoute(finalRoutes[0]);
        }
      } else {
        alert('Could not find route. Please check your locations and try again.');
      }
    });
  };

  // Remove the useEffect that was causing double processing
  useEffect(() => {
    if (directionsResult?.routes?.length > 0 ) {
      const route = directionsResult.routes[selectedRouteIndex];
      if (route) {
        processRoute(route);
      }
    }
  }, [selectedRouteIndex, directionsResult]); // Only trigger when route index changes, not on initial load

  const switchLocation = () => {
    const originInput = document.getElementById('origin');
    const destinationInput = document.getElementById('destination');

    const temp = originInput.value;
    originInput.value = destinationInput.value;
    destinationInput.value = temp;
    
    setOrigin(originInput.value);
    setDestination(destinationInput.value);

    // Calculate route immediately after switching
    setTimeout(() => {
      calculateRoute();
    }, 100); // Small delay to ensure DOM updates
  };

  // Add this function at the top of your component file, before the FareCalculator component
  const createChatBubbleMarker = (text, color = '#FF0000', textColor = 'white') => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="50" height="60" viewBox="0 0 50 60">
        <!-- Drop shadow -->
        <ellipse cx="27" cy="57" rx="12" ry="2" fill="rgba(0,0,0,0.2)"/>
        <!-- Chat bubble -->
        <rect x="5" y="5" width="40" height="30" rx="15" ry="15" 
              fill="${color}" stroke="white" stroke-width="2"/>
        <!-- Bubble tail/pointer -->
        <polygon points="20,35 25,45 30,35" fill="${color}" stroke="white" stroke-width="1"/>
        <!-- Text -->
        <text x="25" y="25" text-anchor="middle" 
              fill="${textColor}" font-family="Arial, sans-serif" 
              font-size="12" font-weight="bold">${text}</text>
      </svg>
    `;
    
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new window.google.maps.Size(50, 60),
      anchor: new window.google.maps.Point(25, 45) // Point where the tail touches the ground
    };
  };

  return isLoaded ? (
    <div className="map-wrapper">
      <div className="fare-container">
        <h2>Transport Fare Calculator & Navigator</h2>
        <p className='fare-description'>Enter your starting point and destination to instantly calculate the estimated fare for your commute.</p>
        <div className="input-group">
          <div className="input-pair">
            <div className="input-with-icon">
              <FaMapMarkerAlt className="input-icon" />
              <input type="text" placeholder="Enter Origin" ref={originRef} id='origin' />
            </div>

            <div className="input-with-icon">
              <FaFlag className="input-icon" />
              <input type="text" placeholder="Enter Destination" ref={destinationRef} id='destination' />
            </div>

            <img src={switchLogo} onClick={switchLocation} className='switch-icon' />
          </div>

          <button onClick={calculateRoute} disabled={isCalculating}>
            {isCalculating ? 'Calculating...' : 'Calculate Fare'}
          </button>
        </div>

        <div className="fare-details">
          {distanceKm > 0 && (
            <>
              <p>Distance: {distanceKm} km</p>
              <p>Estimated Fare: {distanceKm >= 20 ? 'N/A' : `₱${fare}`}</p>
              <p>Suggested Transport: {suggestion}</p>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              </div>
              <div className="transport-info">
                <p dangerouslySetInnerHTML={{ __html: transportMode.replace(/\n/g, '<br/>') }}></p>
              </div>
            </>
          )}
          
          {directionsResult?.routes?.length > 1 && (
            <div className="alternative-routes">
              <h4>Alternative Routes:</h4>
              {directionsResult.routes.map((route, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedRouteIndex(index)}
                  style={{
                    margin: '4px',
                    backgroundColor: selectedRouteIndex === index ? 'green' : '#ccc',
                    color: selectedRouteIndex === index ? '#fff' : '#000',
                    border: 'none',
                    padding: '5px 10px',
                    cursor: 'pointer'
                  }}
                >
                  Route {index + 1} ({route.legs[0].distance.text})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15}>
        {directionsResult && (
          <>
            <DirectionsRenderer
              directions={{
                ...directionsResult,
                routes: [directionsResult.routes[selectedRouteIndex]]
              }}
              options={{
                suppressMarkers: true, // Hide default A/B markers
                polylineOptions: {
                  strokeColor: 'green',
                  strokeOpacity: 1,
                  strokeWeight: 4
                }
              }}
            />
            
            {/* Custom Origin Marker (Point A) with Chat Bubble */}
            <Marker
              position={{
                lat: directionsResult.routes[selectedRouteIndex].legs[0].start_location.lat(),
                lng: directionsResult.routes[selectedRouteIndex].legs[0].start_location.lng()
              }}
              icon={createChatBubbleMarker('Start', '#FF4444', 'white')} // Red bubble
              title={`Origin: ${origin}`}
            />
            
            {/* Custom Destination Marker (Point B) with Chat Bubble */}
            <Marker
              position={{
                lat: directionsResult.routes[selectedRouteIndex].legs[0].end_location.lat(),
                lng: directionsResult.routes[selectedRouteIndex].legs[0].end_location.lng()
              }}
              icon={createChatBubbleMarker('End', '#4444FF', 'white')} // Blue bubble
              title={`Destination: ${destination}`}
            />
          </>
        )}

        <Polyline
          path={jeepneyRoutePath}
          options={{
            strokeColor: '#FF5733',
            strokeOpacity: 0,
            strokeWeight: 4
          }}
        />

        {transferPoints.map((point, index) => (
          <Marker
            key={index}
            position={{ lat: point.lat, lng: point.lng }}
            label={point.name.charAt(0)}
            icon={{ url: "http://maps.google.com/mapfiles/ms/icons/orange-dot.png" }}
          />
        ))}
      </GoogleMap>
    </div>
  ) : (<p>Loading map...</p>);
};

export default FareCalculator;







