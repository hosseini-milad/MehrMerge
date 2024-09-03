import React from 'react';
import {DropZone,Label,Box,DropZoneProps} from '@admin-bro/design-system'
import {BasePropertyProps} from 'admin-bro'

const Edit: React.FC<BasePropertyProps> = (props)=>{
    const {property,onChange} = props;
    const handleDropZone:DropZoneProps['onChange']=(files)=>{
        //onChange('parent',files[0]?.name)
        onChange(property.name,files[0]);
    }
    return(
        <Box>
            <Label>{property.label}</Label>
            <DropZone onChange={handleDropZone}/>
        </Box>
    )
}
export default Edit