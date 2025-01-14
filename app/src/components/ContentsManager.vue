<template>
  <div>
    <v-bottom-sheet v-model="isPoppedUp" persistent>
      <v-sheet class="text-center">
        <v-container id="contents-manager-box">
          <h3 class="mb-2">{{ descriptiveTitle }}</h3>
          <v-row
            v-if="
              (!modeUpload && !searchedImage) || (modeUpload && !uploadedImage)
            "
            class="text-center"
            align="baseline"
          >
            <v-col cols="2"></v-col>
            <v-row>
              <v-col cols="8" class="pa-0">
                <transition name="item-fade" mode="out-in">
                  <v-text-field
                    ref="search-box"
                    v-if="!modeUpload"
                    v-model="searchString"
                    label="KEYWORD "
                    single-line
                    dense
                    :loading="loading"
                    :error="loadedString != '' && !foundImages"
                  ></v-text-field>
                  <v-file-input
                    v-if="modeUpload"
                    v-model="uploadedImage"
                    label="IMAGE"
                    accept="image/*"
                    show-size
                    dense
                  />
                </transition>
              </v-col>
              <v-col cols="4" class="pa-0">
                <h3 class="d-inline pl-2">or</h3>
                <transition name="item-fade" mode="out-in">
                  <v-btn v-if="!modeUpload" text @click="setModeUpload(true)">
                    <h3>upload</h3>
                  </v-btn>
                  <v-btn v-if="modeUpload" text @click="setModeUpload(false)">
                    <h3>search</h3>
                  </v-btn>
                </transition>
              </v-col>
            </v-row>
            <v-col cols="2"></v-col>
          </v-row>
          <transition name="item-fade" mode="out-in">
            <v-row
              v-if="!modeUpload && !searchedImage"
              class="image-box"
              :class="{ active: foundImages && !searchedImage }"
            >
              <v-col>
                <v-container fluid>
                  <v-row dense></v-row>
                  <v-row dense>
                    <v-col
                      v-for="(image, key) in images"
                      :key="key"
                      :cols="3"
                      class="px-2 py-1"
                      @click="selectImage(image)"
                    >
                      <img :src="image.urls.small" />
                    </v-col>
                  </v-row>
                </v-container>
              </v-col>
            </v-row>
            <v-row v-if="!modeUpload && searchedImage">
              <v-col>
                <img :src="searchedImage['urls']['small']" />
              </v-col>
            </v-row>
            <v-row v-if="modeUpload && uploadedImage">
              <v-col>
                <img :src="filePreviewUrl" alt="preview" />
                <!-- <img :src="searchedImage['urls']['small']" /> -->
              </v-col>
            </v-row>
          </transition>
          <v-row
            v-if="
              (modeUpload && !uploadedImage) || (!modeUpload && !searchedImage)
            "
            @click="closePopup()"
          >
            <v-col>
              <h4 class="grey--text">Press esc to cancel</h4>
            </v-col>
          </v-row>
          <v-row v-if="!modeUpload && searchedImage">
            <v-col cols="2"></v-col>
            <v-col cols="8">
              <v-btn outlined class="darken-5 mr-3 mb-3" @click="attachImage('search')">YES</v-btn>
              <v-btn outlined text class="red darken-5 mb-3" @click="cancelImage()">NO</v-btn>
            </v-col>
            <v-col cols="2"></v-col>
          </v-row>
          <v-row v-if="modeUpload && uploadedImage">
            <v-col cols="2"></v-col>
            <v-col cols="8">
              <v-btn
                outlined
                class="darken-5 mr-3 mb-3"
                @click="attachImage('upload')"
              >ATTATCH AS AN IMAGE</v-btn>
              <v-btn
                outlined
                class="darken-5 mr-3 mb-3"
                @click="attachImage('infographic')"
              >ATTATCH AS AN INFOGRAPHIC</v-btn>
              <v-btn outlined text class="red darken-5 mb-3" @click="cancelImage()">NO</v-btn>
            </v-col>
            <v-col cols="2"></v-col>
          </v-row>
        </v-container>
      </v-sheet>
    </v-bottom-sheet>
  </div>
</template>

<script>
import gql from "graphql-tag";
import axios from "axios";
import { registerImage } from "../queries/mutateUpload";

export default {
  name: "custom-contents-manager",
  data: () => ({
    modeUpload: false,
    keyListener: null,
    searchString: "",
    loadedString: "",
    savedString: "",
    loading: false,
    images: null,
    reader: new FileReader(),
    filePreviewUrl: "",
    searchedImage: null,
    uploadedImage: null,
  }),
  mounted () {
    this.keyListener = window.addEventListener("keyup", (ev) => {
      if (!this.isPoppedUp) return;
      if (ev.keyCode == 27) {
        this.$store.commit("setPopupContentsManager", false);
      } else if (ev.keyCode == 13) {
        if (this.loadedString == this.searchString) return;
        this.loading = true;
        axios
          .get(
            "https://api.unsplash.com/search/photos/?client_id=RIKLfPLvf8YseCYe8C3uqeTgJPXqceJa1uaRmb6yBB0&query=" +
            this.searchString
          )
          .then((res) => {
            this.images = res.data.results;
            console.log(this.images, res.data.results);
            this.loadedString = this.searchString;
            this.loading = false;
          });
      } else {
        event.preventDefault();
        return false;
      }
    });

    this.reader.onload = (e) => {
      console.log("reader:");
      console.log(e);
      this.filePreviewUrl = e.target.result;
    };
  },
  destroyed () {
    window.removeEventListener("keyup", this.keyListener);
  },
  computed: {
    descriptiveTitle () {
      if (
        (!this.modeUpload && this.searchedImage) ||
        (this.modeUpload && this.uploadedImage)
      ) {
        return "Attach this?";
      } else if (this.modeUpload) {
        return "Upload an image of";
      } else {
        return "Search an image of";
      }
    },
    foundImages () {
      if (this.images) {
        return this.images.length ? true : false;
      } else return false;
    },
    isPoppedUp () {
      return this.$store.getters.getPopupContentsManager;
    },
    attachedImages () {
      return this.$store.getters.getAttachedImages;
    },
    userInfo () {
      return this.$store.getters.getUserInfo;
    },
  },
  watch: {
    isPoppedUp (newVal, oldVal) {
      if (newVal) {
        setTimeout(() => {
          this.loadedString = this.searchString = "";
          if (!this.modeUpload) this.$refs["search-box"].focus();
        }, 100);
        // document.getElementsByTagName("html")[0].style.overflow = "hidden";
      } else {
        // document.getElementsByTagName("html")[0].style.overflow = "scroll";
        // document.getElementsByClassName("CodeMirror-scroll")[0].focus();
      }
    },
    uploadedImage (newVal, oldVal) {
      if (newVal != oldVal && newVal) {
        this.reader.readAsDataURL(this.uploadedImage);
      }
    },
  },
  methods: {
    selectImage (image) {
      this.searchedImage = image;
      this.filePreviewUrl = image.urls.regular;
    },
    setImageAlias (_alias) {
      // NOTE: save string for lazy search
      let alias = _alias;
      if (alias == "") alias = this.searchString = this.savedString;
      if (this.attachedImages[alias]) {
        let count = 2;
        while (this.attachedImages[alias + count]) count++;
        return alias + count;
      }
      // if (this.attachedImages.find((obj) => obj.alias == alias)) {
      //   let count = 2;
      //   while (this.attachedImages.find((obj) => obj.alias == alias + count)) {
      //     count++;
      //   }
      //   return alias + count;
      // }
      return alias;
    },
    attachImage (type) {
      console.debug(`on attachImage() in ContentsManager (type: ${type}`);
      let image = {};
      if (type == "search") {
        const alias = this.setImageAlias(this.searchString);
        const tags = [];
        this.searchedImage.tags.forEach((val) => {
          tags.push(val.title);
        });

        image = {
          alias: alias,
          fileType: "EXT_IMG",
          url: this.searchedImage.links.html,
          hasInfo: false,
          width: this.searchedImage.width.toString(),
          height: this.searchedImage.height.toString(),
          color: this.searchedImage.color,
          tags: tags.toString(),
          raw: this.searchedImage.urls.raw,
          full: this.searchedImage.urls.full,
          regular: this.searchedImage.urls.regular,
          small: this.searchedImage.urls.small,
          thumb: this.searchedImage.urls.thumb,
          copyright: "unsplash@" + this.searchedImage.user.name,
          copyrightLink: this.searchedImage.links.html,
        };

        this.$store.commit("attachImage", {
          uploaded: true,
          image: image,
        });
        this.$apollo
          .mutate({
            client: "inspiredBy",
            mutation: registerImage,
            variables: image,
            context: {
              headers: {
                authorization: "Bearer " + this.userInfo.accessToken,
              },
            },
          })
          .then((res) => {
            console.debug("successfully registered(): ", res);
            this.$store.commit("updateImage", {
              alias: image.alias,
              registered: true,
              registeredId: res.data.registerImage.imageId,
            });
          })
      } else if (type == "infographic") {
        console.log("user: ", this.user);
        image = {
          alias: this.uploadedImage.name.split(".")[0],
          fileType: "LOCAL_IMG",
          hasInfo: true,
          url: null, // TODO: should update this
          copyright: "inspired-by@" + this.user.alias,
        };
      } else {
        image = {
          type: "local",
          hasInfo: false,
          alias: this.uploadedImage.name.split(".")[0],
          data: this.uploadedImage,
        };
      }
      console.debug("image: ", image);

      let formData = new FormData();
      formData.append("image", image);

      // await axios
      //   .post("http://localhost:4000/upload", formData, {})
      //   .then(res => {
      //     console.log("received: ");
      //     console.log(res);
      //   });
      // this.$store.commit("uploadImage", uploadedImage);
      // await this.$apollo.mutate({
      //   client: "upload",
      //   mutation: gql`
      //     mutation($file: Upload!) {
      //       testS3(file: $file) {
      //         success
      //         message
      //       }
      //     }
      //   `,
      //   variables: {
      //     file: this.uploadedImage
      //   },
      //   update: (data => {
      //     console.debug("upload data: ");
      //     console.debug(data);
      //   }).bind(this)
      // });

      // image["previewUrl"] = this.filePreviewUrl;
      // this.$store.commit("uploadImage", image);
      this.$store.commit("imageToContent", image);

      setTimeout(() => {
        this.cancelImage();
      }, 1000);
      this.closePopup();
    },
    cancelImage (type = "both") {
      switch (type) {
        case "both":
          this.uploadedImage = null;
        case "search":
          this.searchedImage = null;
          break;
        case "upload":
          this.uploadedImage = null;
      }
    },
    closePopup () {
      this.savedString = this.searchString;
      this.$store.commit("setPopupContentsManager", false);
    },
    setModeUpload (val) {
      this.modeUpload = val;
    },
  },
};
</script>

<style lang="scss" scoped>
img {
  max-height: 50vh;
}
.image-box {
  height: 0;
  overflow-y: hidden;
  transition: height 0.5s;
  &.active {
    height: 50vh;
  }
  .container {
    height: 50vh;
    overflow-y: auto;
    .col {
      width: 25vw;
      height: 40vw;
      overflow-x: hidden;
      overflow-y: hidden;
      transition: padding 0.5s;
      // .col:hover {
      //   padding: 0;
      // }
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: width 0.5s, height 0.5s;
      }
      img:hover {
        margin-left: -25%;
        width: 150%;
      }
    }
  }
}
</style>

<style lang="scss">
#contents-manager-box {
  .v-text-field__slot {
    input {
      text-align: center;
      font-size: large;
    }
    label {
      left: calc(50% - 3em) !important;
    }
  }
  .v-file-input {
    label {
      left: 1em !important;
    }
    .v-file-input__text {
      padding-left: 1em;
    }
  }
}
</style>
