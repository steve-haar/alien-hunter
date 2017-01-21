"use strict";
(function (ElementType) {
    ElementType[ElementType["Alien"] = 0] = "Alien";
    ElementType[ElementType["Hunter"] = 1] = "Hunter";
    ElementType[ElementType["Block"] = 2] = "Block";
})(exports.ElementType || (exports.ElementType = {}));
var ElementType = exports.ElementType;
(function (InitialSpaceType) {
    InitialSpaceType[InitialSpaceType["Background"] = 0] = "Background";
    InitialSpaceType[InitialSpaceType["Block"] = 1] = "Block";
    InitialSpaceType[InitialSpaceType["BothSpawn"] = 2] = "BothSpawn";
    InitialSpaceType[InitialSpaceType["AlienSpawn"] = 3] = "AlienSpawn";
    InitialSpaceType[InitialSpaceType["HunterSpawn"] = 4] = "HunterSpawn";
})(exports.InitialSpaceType || (exports.InitialSpaceType = {}));
var InitialSpaceType = exports.InitialSpaceType;
(function (PlayerType) {
    PlayerType[PlayerType["Alien"] = 0] = "Alien";
    PlayerType[PlayerType["Hunter"] = 1] = "Hunter";
})(exports.PlayerType || (exports.PlayerType = {}));
var PlayerType = exports.PlayerType;
(function (Direction) {
    Direction[Direction["None"] = 0] = "None";
    Direction[Direction["Up"] = 1] = "Up";
    Direction[Direction["Down"] = 2] = "Down";
    Direction[Direction["Left"] = 3] = "Left";
    Direction[Direction["Right"] = 4] = "Right";
})(exports.Direction || (exports.Direction = {}));
var Direction = exports.Direction;
//# sourceMappingURL=C:/Github/steve-haar/alien-hunter/server/src/shared/model/enum.js.map