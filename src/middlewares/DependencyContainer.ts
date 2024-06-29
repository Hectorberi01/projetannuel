import {DataSource} from "typeorm";
import {InfoUseCase} from "../domain/info-usecase";
import {MessageUseCase} from "../domain/message-usecase";
import {CotisationUseCase} from "../domain/cotisation-usecase";
import {ImageUseCase} from "../domain/image-usecase";
import {RoleUseCase} from "../domain/roles-usecase";
import {ClubUseCase} from "../domain/club-usecase";
import {FormationCenterUseCase} from "../domain/formationcenter-usecase";
import {PlayerUseCase} from "../domain/player-usercase";

class DependencyContainer {
    private static instance: DependencyContainer;
    private db: DataSource;

    private constructor(db: DataSource) {
        this.db = db;
    }

    public static getInstance(db: DataSource): DependencyContainer {
        if (!DependencyContainer.instance) {
            DependencyContainer.instance = new DependencyContainer(db);
        }
        return DependencyContainer.instance;
    }

    public get infoUseCase(): InfoUseCase {
        return new InfoUseCase(this.db);
    }

    public get messageUseCase(): MessageUseCase {
        return new MessageUseCase(this.db);
    }

    public get cotisationUseCase(): CotisationUseCase {
        return new CotisationUseCase(this.db);
    }

    public get imageUseCase(): ImageUseCase {
        return new ImageUseCase(this.db);
    }

    public get roleUseCase(): RoleUseCase {
        return new RoleUseCase(this.db);
    }

    public get clubUseCase(): ClubUseCase {
        return new ClubUseCase(this.db);
    }

    public get formationCenterUseCase(): FormationCenterUseCase {
        return new FormationCenterUseCase(this.db);
    }

    public get playerUseCase(): PlayerUseCase {
        return new PlayerUseCase(this.db);
    }
}

export default DependencyContainer;
