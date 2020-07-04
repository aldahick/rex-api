import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import axios from "axios";
import * as cheerio from "cheerio";
import * as _ from "lodash";
import { singleton } from "tsyringe";

const BASE_URL = "https://group.ultimate-bravery.net";

@singleton()
export class UltimateBraveryService {
  async createGroup({ username, mapName, regionName, isPublic }: {
    username: string;
    mapName: string;
    regionName: string;
    isPublic: boolean;
  }) {
    const { data: html } = await axios.get(`${BASE_URL}/Home/Group`);
    const $ = cheerio.load(html);

    // use the default level
    const level = Number($("#Level").val());

    // find the map ID
    const mapId = Number($("input[name=SelectedMap]")
      .parent(`:contains("${mapName}")`)
      .children("input")
      .val());

    // find region ID
    const regionId = Number($(`#Region option:contains("${regionName}")`).val());

    // use max number of participants
    const participantCount = Number($("#NumberOfParticipants").attr("data-val-range-max"));

    const connection = new HubConnectionBuilder()
      .withUrl(`${BASE_URL}/grouphub`)
      .configureLogging(LogLevel.None)
      .build();
    await connection.start();

    const onJoin = new Promise<number>(resolve => {
      connection.on("JoinedSuccessfully", (gid: number) => {
        connection.off("JoinedSuccessfully");
        resolve(gid);
      });
    });

    await connection.invoke("CreateGroup", username, level, mapId, regionId, participantCount, isPublic);

    const groupId = await onJoin;

    connection.on("PlayerJoined", () => {
      connection.stop().catch(_.noop);
    });

    return `${BASE_URL}/Home/Group/${groupId}`;
  }
}
