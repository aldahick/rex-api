import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import axios from "axios";
import { singleton } from "tsyringe";

const GROUP_BASE_URL = "https://ultimate-bravery.net/Classic/Group";
const API_BASE_URL = "https://api.ultimate-bravery.net";

@singleton()
export class UltimateBraveryService {
  async createGroup({ username, level, participantCount, isPublic }: {
    username: string;
    isPublic: boolean;
    level: number;
    participantCount: number;
  }): Promise<string> {
    const connection = await this.connect();

    const onCreate = new Promise<number>(resolve => {
      connection.on("CreatedGroupSuccessfully", (gid: number) => {
        connection.off("CreatedGroupSuccessfully");
        resolve(gid);
      });
    });

    const regionId = "NA1";
    const mapId = 12;

    await connection.invoke("CreateGroup", username, level, mapId, regionId, participantCount, isPublic);

    const groupId = await onCreate;

    connection.on("PlayerJoined", () => {
      connection.stop().catch(null);
    });

    return `${GROUP_BASE_URL}/?groupId=${groupId}`;
  }

  private async connect(): Promise<HubConnection> {
    const { data: { token } } = await axios.post<{
      id: string;
      token: string;
    }>(`${API_BASE_URL}/bo/api/ultimate-bravery/v1/authenticate`);

    const connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/grouphub`, {
        accessTokenFactory: () => token
      })
      .configureLogging(LogLevel.None)
      .build();
    await connection.start();

    return connection;
  }
}
