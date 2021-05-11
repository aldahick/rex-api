import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import axios from "axios";
import { singleton } from "tsyringe";

const API_URL = "https://api2.ultimate-bravery.net";
const GROUP_URL = "https://ultimate-bravery.net/Classic/Group";

@singleton()
export class UltimateBraveryService {
  async createLobby({ username, isPublic, level, size, regionId, mapId }: {
    username: string;
    isPublic: boolean;
    level: number;
    size: number;
    regionId: string;
    mapId: number;
  }): Promise<string> {
    const connection = await this.getConnection();
    const onCreate = new Promise<number>(resolve =>
      connection.on("CreatedGroupSuccessfully", resolve)
    );
    await connection.invoke("CreateGroup", username, level, mapId, regionId, size, isPublic);
    const groupId = await onCreate;
    connection.on("PlayerJoined", () => {
      connection.stop().catch(null);
    });
    return `${GROUP_URL}/?groupId=${groupId}`;
  }

  private async getConnection(): Promise<HubConnection> {
    const token = await axios.post<{
      id: string;
      token: string;
    }>(`${API_URL}/bo/api/ultimate-bravery/v1/authenticate`)
      .then(r => r.data.token);
    const connection = new HubConnectionBuilder()
      .withUrl(`${API_URL}/grouphub`, {
        accessTokenFactory: () => token
      })
      .configureLogging(LogLevel.None)
      .build();
    await connection.start();
    return connection;
  }
}
