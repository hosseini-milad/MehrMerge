import React  from 'react';
import {DropZone, DropZoneProps,Label,Box} from '@admin-bro/design-system'
import {BasePropertyProps} from 'admin-bro'

const EditUpload: React.FC<BasePropertyProps> = (props)=>{
    const {property,record,onChange} = props;
    const handleDropZone:DropZoneProps['onChange']=(files)=>{
        onChange('imgGalleryUrl',files[0]?.name)
        console.log(property.name,files[0])
        //onChange(property.name,files[0])
        
    }
    return(
        <Box>
            <Label>{property.label}</Label>
            <div style={{display:"flex"}}>
                <DropZone onChange={handleDropZone}/>

                <DropZone onChange={handleDropZone}/>
                <DropZone onChange={handleDropZone}/>
                <DropZone onChange={handleDropZone}/>
            </div>
        </Box>
    )
}
export default EditUpload